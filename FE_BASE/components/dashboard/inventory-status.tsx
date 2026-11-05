'use client'

import { Cell, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { INVENTORY } from './dashboard-data'

const chartConfig = Object.fromEntries(
  INVENTORY.map((segment) => [segment.key, { label: segment.label, color: segment.color }]),
) satisfies ChartConfig

export function InventoryStatus() {
  const total = INVENTORY.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <Card className="gap-0 rounded-md bg-white py-0 text-gray-900 shadow-none ring-1 ring-gray-300">
      <CardHeader className="border-b border-gray-300 px-4 py-3 md:px-6">
        <CardTitle className="text-base font-bold text-gray-900">Estado del inventario</CardTitle>
        <CardDescription className="text-sm text-gray-600">Corte al 29/10/2026</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-4 md:p-6">
        <div className="relative mx-auto size-44">
          <ChartContainer config={chartConfig} className="aspect-square size-44">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
              <Pie data={INVENTORY} dataKey="value" nameKey="key" innerRadius={56} outerRadius={84} strokeWidth={2} stroke="#fff">
                {INVENTORY.map((segment) => (
                  <Cell key={segment.key} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{total.toLocaleString('es-PE')}</span>
            <span className="text-xs font-medium text-gray-600">ejemplares</span>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {INVENTORY.map((segment) => {
            const percent = (segment.value / total) * 100
            return (
              <li key={segment.key}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-800">
                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                    {segment.label}
                  </span>
                  <span className="tabular-nums text-gray-700">
                    <span className="font-bold text-gray-900">{segment.value.toLocaleString('es-PE')}</span> ·{' '}
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-label={segment.label}
                  aria-valuenow={Math.round(percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: segment.color }} />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
