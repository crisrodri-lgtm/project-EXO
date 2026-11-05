'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { AREA_LABELS, type TrendPoint } from './dashboard-data'

const chartConfig = {
  sistemas: { label: AREA_LABELS.sistemas, color: '#1E3A8A' },
  ingenieria: { label: AREA_LABELS.ingenieria, color: '#3B82F6' },
  literatura: { label: AREA_LABELS.literatura, color: '#0D9488' },
  ciencias: { label: AREA_LABELS.ciencias, color: '#D97706' },
} satisfies ChartConfig

const AREA_KEYS = Object.keys(chartConfig) as (keyof typeof chartConfig)[]

export function LoansTrendChart({ data, rangeLabel }: { data: TrendPoint[]; rangeLabel: string }) {
  const total = data.reduce((sum, point) => sum + AREA_KEYS.reduce((acc, key) => acc + point[key], 0), 0)

  return (
    <Card className="gap-0 rounded-md bg-white py-0 text-gray-900 shadow-none ring-1 ring-gray-300">
      <CardHeader className="border-b border-gray-300 px-4 py-3 md:px-6">
        <CardTitle className="text-base font-bold text-gray-900">Préstamos por área de conocimiento</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {rangeLabel} · {total.toLocaleString('es-PE')} préstamos registrados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart data={data} margin={{ left: -12, right: 4, top: 8 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="periodo" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={44} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <ChartTooltip cursor={{ fill: '#F3F4F6' }} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {AREA_KEYS.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="areas"
                fill={`var(--color-${key})`}
                radius={index === AREA_KEYS.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
