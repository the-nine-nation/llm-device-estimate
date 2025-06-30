import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Cpu, Zap, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            LLM资源预估系统
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            精确预估大语言模型训练与推理所需的GPU资源，为您的AI项目提供科学的硬件配置建议
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/training">训练资源预估</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/inference">推理资源预估</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-shadow">
              <CardHeader className="text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <CardTitle>精确计算</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  基于模型架构和训练配置，精确计算显存占用、激活值显存等资源需求
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader className="text-center">
                <Cpu className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <CardTitle>多种方法</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  支持全参数微调、LoRA、QLoRA等多种训练方法，适配不同的应用场景
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <CardTitle>推理优化</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  针对vLLM、TensorRT-LLM等推理框架，提供性能和资源优化建议
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <CardTitle>智能推荐</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  根据资源需求推荐合适的GPU配置，并提供成本效益分析
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Models */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">支持的模型</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">LLaMA系列</h3>
              <p className="text-muted-foreground">
                LLaMA 7B/13B/70B<br />
                LLaMA 2 7B/13B/70B
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Qwen系列</h3>
              <p className="text-muted-foreground">
                Qwen 7B/14B/72B<br />
                Qwen2 7B/72B
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">其他模型</h3>
              <p className="text-muted-foreground">
                Mistral 7B, Mixtral 8x7B<br />
                ChatGLM, Baichuan, 自定义模型
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">开始使用</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">训练资源预估</CardTitle>
                <CardDescription>
                  计算模型训练所需的GPU显存、优化器状态、梯度显存等资源
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/training">开始预估训练资源</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">推理资源预估</CardTitle>
                <CardDescription>
                  预估模型推理的显存占用、KV Cache、吞吐量和延迟等指标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/inference">开始预估推理资源</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 