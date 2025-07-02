"""
训练资源计算服务
"""

from typing import Dict, Any, Optional
import math

from ...models.training import TrainingRequest, TrainingResponse, TrainingMethod, OptimizerType, DeepSpeedStage, AccelerationMethod, LoRAConfig
from ...models.common import PrecisionType, ModelInfo, ModelSize
from ...services.model_registry import ModelRegistry
from .base_calc import BaseCalculator


class TrainingCalculator(BaseCalculator):
    """训练资源计算器"""
    
    # 优化器状态系数
    OPTIMIZER_STATE_MULTIPLIER = {
        OptimizerType.ADAMW: 2.0,  # beta1, beta2 动量
        OptimizerType.ADAM: 2.0,   # beta1, beta2 动量  
        OptimizerType.SGD: 1.0     # 动量
    }
    

    
    def __init__(self):
        """初始化训练计算器"""
        super().__init__()
        self.model_registry = ModelRegistry()
    
    def calculate(self, request: TrainingRequest) -> TrainingResponse:
        """
        计算训练资源需求
        
        Args:
            request: 训练预估请求
            
        Returns:
            训练资源预估结果
        """
        # 获取模型信息
        model = self._get_model_info(request)
        
        # 计算各种显存需求
        model_memory = self._calculate_model_memory(model, request)
        activation_memory = self._calculate_activation_memory(model, request)
        optimizer_memory = self._calculate_optimizer_memory(model, request)
        gradient_memory = self._calculate_gradient_memory(model, request)
        
        # 计算总显存
        # 多卡训练时需要考虑各组件的分片情况
        if request.data_parallel > 1:
            # 多卡训练总显存计算
            if request.deepspeed_stage == DeepSpeedStage.STAGE3:
                # Stage 3: 所有组件都分片
                total_memory = (model_memory + activation_memory + 
                               (optimizer_memory or 0) + (gradient_memory or 0) +
                               self.get_framework_overhead("pytorch") * request.data_parallel)
            elif request.deepspeed_stage == DeepSpeedStage.STAGE2:
                # Stage 2: 模型权重不分片，优化器和梯度分片
                total_memory = (model_memory * request.data_parallel + activation_memory + 
                               (optimizer_memory or 0) + (gradient_memory or 0) +
                               self.get_framework_overhead("pytorch") * request.data_parallel)
            elif request.deepspeed_stage == DeepSpeedStage.STAGE1:
                # Stage 1: 只有优化器分片
                total_memory = (model_memory * request.data_parallel + activation_memory + 
                               (optimizer_memory or 0) + (gradient_memory or 0) * request.data_parallel +
                               self.get_framework_overhead("pytorch") * request.data_parallel)
            else:
                # 不使用DeepSpeed: 除激活值外，其他组件每张卡都需要完整副本
                total_memory = (model_memory * request.data_parallel + activation_memory + 
                               (optimizer_memory or 0) * request.data_parallel + 
                               (gradient_memory or 0) * request.data_parallel +
                               self.get_framework_overhead("pytorch") * request.data_parallel)
        else:
            # 单卡训练
            total_memory = (model_memory + activation_memory + 
                           (optimizer_memory or 0) + (gradient_memory or 0) +
                           self.get_framework_overhead("pytorch"))
        
        # 计算有效批次大小
        effective_batch_size = (request.batch_size * 
                              request.gradient_accumulation_steps * 
                              request.data_parallel)
        
        # 计算GPU需求
        # 考虑DeepSpeed分片后的实际单卡显存需求
        # 注意：激活值在数据并行训练中总是按GPU数量分片（每张卡处理不同的batch）
        activation_memory_per_gpu = activation_memory / request.data_parallel
        
        if request.deepspeed_stage == DeepSpeedStage.STAGE3:
            # Stage 3分片所有参数，显存需求最小
            memory_per_gpu = (model_memory / request.data_parallel + 
                            activation_memory_per_gpu + 
                            (optimizer_memory or 0) / request.data_parallel +
                            (gradient_memory or 0) / request.data_parallel +
                            self.get_framework_overhead("pytorch"))
        elif request.deepspeed_stage == DeepSpeedStage.STAGE2:
            # Stage 2分片优化器状态和梯度
            memory_per_gpu = (model_memory + 
                            activation_memory_per_gpu + 
                            (optimizer_memory or 0) / request.data_parallel +
                            (gradient_memory or 0) / request.data_parallel +
                            self.get_framework_overhead("pytorch"))
        elif request.deepspeed_stage == DeepSpeedStage.STAGE1:
            # Stage 1只分片优化器状态
            memory_per_gpu = (model_memory + 
                            activation_memory_per_gpu + 
                            (optimizer_memory or 0) / request.data_parallel +
                            (gradient_memory or 0) +
                            self.get_framework_overhead("pytorch"))
        else:
            # 不使用DeepSpeed，模型权重、优化器和梯度不分片，但激活值按GPU数量分片
            memory_per_gpu = (model_memory + 
                            activation_memory_per_gpu + 
                            (optimizer_memory or 0) +
                            (gradient_memory or 0) +
                            self.get_framework_overhead("pytorch"))
        
        min_gpu_count = max(1, math.ceil(total_memory / 80))  # 假设80GB显存
        optimal_gpu_count = request.data_parallel
        
        # 显存分解
        memory_breakdown = {
            "model_weights": model_memory,
            "activations": activation_memory,
            "optimizer_states": optimizer_memory or 0,
            "gradients": gradient_memory or 0,
            "framework_overhead": self.get_framework_overhead("pytorch")
        }
        
        # 性能预估
        estimated_tokens_per_second = self._estimate_training_speed(model, request)
        
        # 生成推荐GPU列表
        from ...utils.helpers import recommend_gpus
        recommended_gpus = recommend_gpus(memory_per_gpu, max_count=5, use_case="training")
        
        # 生成优化建议
        recommendations = self._generate_recommendations(model, request, total_memory, memory_per_gpu)
        
        return TrainingResponse(
            # 基础显存信息
            total_memory_gb=total_memory,
            model_memory_gb=model_memory,
            activation_memory_gb=activation_memory,
            optimizer_memory_gb=optimizer_memory,
            gradient_memory_gb=gradient_memory,
            framework_overhead_gb=self.get_framework_overhead("pytorch"),
            recommended_gpus=recommended_gpus,
            min_gpu_count=min_gpu_count,
            optimal_gpu_count=optimal_gpu_count,
            
            # 训练特定信息
            training_method=request.training_method,
            effective_batch_size=effective_batch_size,
            memory_per_gpu=memory_per_gpu,
            memory_breakdown=memory_breakdown,
            estimated_tokens_per_second=estimated_tokens_per_second,
            estimated_time_per_epoch=None,  # 需要更多信息才能计算
            recommendations=recommendations
        )
    


    def _get_model_info(self, request: TrainingRequest) -> ModelInfo:
        """获取模型信息"""
        if request.model_id:
            return self.model_registry.get_model_info(request.model_id)
        elif request.custom_model:
            return request.custom_model
        elif request.parameters_billion:
            # 根据参数数量创建临时模型信息
            return self._create_model_from_parameters(request.parameters_billion)
        else:
            raise ValueError("必须提供模型信息")
    
    def _create_model_from_parameters(self, parameters_billion: float) -> ModelInfo:
        """根据参数数量创建模型信息"""
        # 将参数转换为实际数量
        parameters = int(parameters_billion * 1e9)
        
        # 根据参数数量估算模型架构（基于Transformer架构的经验公式）
        # 这些公式基于主流大语言模型的架构规律
        
        if parameters_billion <= 1:
            # 小于1B的模型
            hidden_size = 1024
            num_layers = 12
            num_heads = 16
        elif parameters_billion <= 3:
            # 1-3B模型
            hidden_size = 2048
            num_layers = 24
            num_heads = 16
        elif parameters_billion <= 7:
            # 3-7B模型
            hidden_size = 4096
            num_layers = 32
            num_heads = 32
        elif parameters_billion <= 13:
            # 7-13B模型
            hidden_size = 5120
            num_layers = 40
            num_heads = 40
        elif parameters_billion <= 30:
            # 13-30B模型
            hidden_size = 6656
            num_layers = 60
            num_heads = 52
        elif parameters_billion <= 70:
            # 30-70B模型
            hidden_size = 8192
            num_layers = 80
            num_heads = 64
        else:
            # 70B以上模型
            hidden_size = 12288
            num_layers = 96
            num_heads = 96
        
        return ModelInfo(
            id=f"custom-{parameters_billion}b",
            name=f"自定义 {parameters_billion}B 参数模型",
            family="custom",
            parameters=parameters,
            hidden_size=hidden_size,
            num_layers=num_layers,
            num_heads=num_heads,
            vocab_size=32000,  # 标准词汇表大小
            context_length=2048,  # 默认上下文长度
            architecture="transformer",
            precision=PrecisionType.FP16,
            size_category=self._get_model_size_category(parameters_billion)
        )
    
    def _get_model_size_category(self, parameters_billion: float):
        """根据参数数量确定模型规模类别"""
        if parameters_billion < 1:
            return ModelSize.SMALL
        elif parameters_billion < 10:
            return ModelSize.MEDIUM
        elif parameters_billion < 100:
            return ModelSize.LARGE
        else:
            return ModelSize.XLARGE
    
    def _calculate_model_memory(self, model: ModelInfo, request: TrainingRequest) -> float:
        """计算模型权重显存"""
        if request.training_method == TrainingMethod.FULL_FINETUNING:
            return self.calculate_model_memory(model, request.precision)
        else:
            # LoRA方法只需要原模型 + LoRA参数
            base_memory = self.calculate_model_memory(model, request.precision)
            lora_params = self._calculate_lora_parameters(model, request.lora_config)
            lora_memory = lora_params * self.PRECISION_BYTES[request.precision] / (1024**3)
            return base_memory + lora_memory
    
    def _calculate_activation_memory(self, model: ModelInfo, request: TrainingRequest) -> float:
        """计算激活值显存"""
        # 激活值大小 = batch_size * sequence_length * hidden_size * num_layers * bytes_per_element
        bytes_per_element = self.PRECISION_BYTES[request.precision]
        
        # 基础激活值
        activation_size = (request.batch_size * request.sequence_length * 
                         model.hidden_size * model.num_layers * bytes_per_element)
        
        # 注意力机制的激活值（Q, K, V）
        attention_size = (request.batch_size * model.num_heads * 
                        request.sequence_length * request.sequence_length * 
                        bytes_per_element * model.num_layers)
        
        total_bytes = activation_size + attention_size
        
        # 梯度检查点可以减少激活值显存
        if request.gradient_checkpointing:
            total_bytes *= 0.3  # 约减少70%
        
        # 应用加速方法的显存优化
        total_bytes = self._apply_acceleration_method(total_bytes, request)
        
        return self.convert_bytes(total_bytes)
    
    def _apply_acceleration_method(self, memory_bytes: float, request: TrainingRequest) -> float:
        """应用加速方法的显存优化"""
        if request.acceleration_method == AccelerationMethod.FLASH_ATTENTION_2:
            # Flash Attention 2的核心优化：避免materialization N×N注意力矩阵
            # 将O(N²)的注意力矩阵存储替换为O(N)的统计信息存储
            memory_bytes = self._apply_flash_attention_optimization(memory_bytes, request)
        
        elif request.acceleration_method == AccelerationMethod.UNSLOTH:
            # Unsloth 在 Flash Attention 2 基础上额外优化
            # 根据官方文档：支持4倍于HF+FA2的上下文长度，意味着显存效率约4倍
            # 总体减少约75%的激活值显存
            memory_bytes *= 0.25
        
        return memory_bytes
    
    def _apply_flash_attention_optimization(self, total_activation_memory: float, request: TrainingRequest) -> float:
        """
        应用Flash Attention的具体优化算法
        
        基于实际benchmarks修正：Flash Attention的主要优化不是大幅减少内存，
        而是提高计算效率和支持更长序列。实际内存优化幅度相对温和。
        """
        # 获取序列长度以确定优化幅度
        seq_len = request.sequence_length
        
        # 根据实际测试数据，Flash Attention的内存优化效果：
        # 1. 短序列（<= 2048）：优化幅度约10-15%
        # 2. 中序列（2048-8192）：优化幅度约15-25%  
        # 3. 长序列（> 8192）：优化幅度约25-35%
        
        if seq_len <= 2048:
            # 短序列：优化幅度较小
            optimization_factor = 0.85  # 减少15%
        elif seq_len <= 8192:
            # 中长序列：中等优化幅度
            optimization_factor = 0.80  # 减少20%
        else:
            # 长序列：较大优化幅度
            optimization_factor = 0.70  # 减少30%
        
        # 应用优化
        optimized_memory = total_activation_memory * optimization_factor
        
        return optimized_memory
    
    def _calculate_optimizer_memory(self, model: ModelInfo, request: TrainingRequest) -> Optional[float]:
        """计算优化器状态显存"""
        if request.training_method == TrainingMethod.LORA:
            # LoRA方法只优化LoRA参数
            trainable_params = self._calculate_lora_parameters(model, request.lora_config)
        else:
            trainable_params = model.parameters
        
        multiplier = self.OPTIMIZER_STATE_MULTIPLIER.get(request.optimizer, 1.0)
        bytes_per_param = self.PRECISION_BYTES[request.precision]
        
        # DeepSpeed ZeRO可以分片优化器状态
        if request.deepspeed_stage in [DeepSpeedStage.STAGE1, DeepSpeedStage.STAGE2, DeepSpeedStage.STAGE3]:
            # 优化器状态在多个GPU间分片
            sharding_factor = request.data_parallel
        else:
            sharding_factor = 1
        
        total_bytes = trainable_params * bytes_per_param * multiplier / sharding_factor
        return self.convert_bytes(total_bytes)
    
    def _calculate_gradient_memory(self, model: ModelInfo, request: TrainingRequest) -> Optional[float]:
        """计算梯度显存"""
        if request.training_method == TrainingMethod.LORA:
            # LoRA方法只需要LoRA参数的梯度
            trainable_params = self._calculate_lora_parameters(model, request.lora_config)
        else:
            trainable_params = model.parameters
        
        bytes_per_param = self.PRECISION_BYTES[request.precision]
        
        # DeepSpeed ZeRO Stage 2/3可以分片梯度
        if request.deepspeed_stage in [DeepSpeedStage.STAGE2, DeepSpeedStage.STAGE3]:
            sharding_factor = request.data_parallel
        else:
            sharding_factor = 1
        
        # 基础梯度显存
        total_bytes = trainable_params * bytes_per_param / sharding_factor
        
        # 梯度累积的额外显存开销
        # 实际测试表明，梯度累积会增加5-15%的额外显存开销
        if request.gradient_accumulation_steps > 1:
            # 梯度累积开销因子：基于累积步数的对数增长
            # 步数越多，开销相对减少（因为分摊效应）
            accumulation_overhead = 1.0 + (0.10 * (1 + 0.5 * math.log(request.gradient_accumulation_steps)))
            
            # 优化器类型影响：Adam系列需要更多缓冲区
            if request.optimizer in [OptimizerType.ADAMW, OptimizerType.ADAM]:
                accumulation_overhead *= 1.15  # Adam额外增加15%开销
            
            total_bytes *= accumulation_overhead
        
        return self.convert_bytes(total_bytes)
    
    def _estimate_training_speed(self, model: ModelInfo, request: TrainingRequest) -> Optional[float]:
        """预估训练速度（tokens/s）"""
        # 基础速度（假设A100 GPU）
        base_speed = 2000
        
        # 根据模型大小调整
        if model.parameters > 70e9:  # > 70B
            base_speed *= 0.05
        elif model.parameters > 30e9:  # > 30B
            base_speed *= 0.15
        elif model.parameters > 13e9:  # > 13B
            base_speed *= 0.3
        elif model.parameters > 7e9:   # > 7B
            base_speed *= 0.5
        else:  # <= 7B
            base_speed *= 0.8
            
        # 根据训练方法调整
        if request.training_method == TrainingMethod.LORA:
            base_speed *= 1.5  # LoRA方法更快
            
        # 根据序列长度调整
        seq_factor = min(2048, request.sequence_length) / 2048
        base_speed *= seq_factor
        
        # 根据批次大小调整
        batch_factor = min(32, request.batch_size) / 8
        base_speed *= batch_factor
        
        # 根据并行度调整
        parallel_efficiency = 0.9 ** (request.data_parallel - 1)
        base_speed *= parallel_efficiency * request.data_parallel
        
        return max(10, base_speed)  # 最小10 tokens/s
    
    def _generate_recommendations(self, model: ModelInfo, request: TrainingRequest, 
                                total_memory: float, memory_per_gpu: float) -> Dict[str, Any]:
        """生成优化建议"""
        recommendations = {}
        
        # 显存优化建议
        if memory_per_gpu > 80:  # 单卡显存超过80GB
            recommendations["memory_optimization"] = [
                "单卡显存需求较高，建议使用更多GPU或开启DeepSpeed",
                "考虑使用DeepSpeed ZeRO Stage 3进行更深度的模型分片",
                "启用gradient_checkpointing减少激活值显存",
                "考虑使用LoRA等参数高效微调方法"
            ]
        elif total_memory > 80 and request.data_parallel == 1:
            recommendations["memory_optimization"] = [
                "建议增加GPU数量进行多卡训练",
                "或者使用LoRA等参数高效微调方法",
                "开启gradient_checkpointing可减少30-70%激活值显存"
            ]
        
        # DeepSpeed建议
        if request.data_parallel > 1:
            if request.deepspeed_stage is None:
                recommendations["deepspeed_optimization"] = [
                    f"当前多卡训练未使用DeepSpeed，每张卡需要{memory_per_gpu:.1f}GB显存",
                    "建议开启DeepSpeed ZeRO以大幅减少单卡显存占用",
                    f"Stage 2可减少优化器显存，Stage 3可减少40-60%显存需求",
                    "特别推荐Stage 3用于大模型训练"
                ]
            else:
                stage_name = request.deepspeed_stage.value.replace('_', ' ').title()
                recommendations["deepspeed_optimization"] = [
                    f"已启用DeepSpeed {stage_name}",
                    f"单卡显存需求已优化至{memory_per_gpu:.1f}GB",
                    f"相比不使用DeepSpeed节省了显存开销",
                    "可根据实际显存使用情况调整Stage级别"
                ]
        
        # 训练方法建议
        if request.training_method == TrainingMethod.FULL_FINETUNING and model.parameters > 10e9:
            recommendations["training_method"] = [
                "对于大模型，建议使用LoRA或QLoRA以减少显存占用",
                "全参数微调可能需要大量GPU资源"
            ]
        
        # 批次大小建议
        if request.batch_size > 32:
            recommendations["batch_size"] = [
                "考虑减少batch_size并增加gradient_accumulation_steps",
                "大批次可能导致显存不足"
            ]
        
        return recommendations
    
    def _calculate_lora_parameters(self, model: ModelInfo, lora_config: Optional[LoRAConfig]) -> int:
        """
        计算LoRA新增的参数数量
        
        Args:
            model: 模型信息
            lora_config: LoRA配置
            
        Returns:
            LoRA参数数量
        """
        if not lora_config:
            lora_config = LoRAConfig()  # 使用默认配置
        
        rank = lora_config.rank
        
        # 根据target_modules计算适配的层数
        # 默认适配所有线性层：q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj
        if lora_config.target_modules == "all-linear":
            # 每层有7个线性层（注意力4个 + FFN 3个）
            linear_layers_per_layer = 7
        else:
            # 解析target_modules字符串，计算实际的线性层数
            if isinstance(lora_config.target_modules, str) and lora_config.target_modules:
                target_modules = lora_config.target_modules.split(',')
                linear_layers_per_layer = len([m.strip() for m in target_modules if m.strip()])
            else:
                # 默认只适配注意力层
                linear_layers_per_layer = 4  # q, k, v, o
        
        total_linear_layers = model.num_layers * linear_layers_per_layer
        
        # LoRA参数计算：每个适配层增加 rank * (input_dim + output_dim) 个参数
        # 对于注意力层和FFN层，input_dim = output_dim = hidden_size
        lora_params_per_layer = rank * (model.hidden_size + model.hidden_size)
        total_lora_params = total_linear_layers * lora_params_per_layer
        
        return total_lora_params 