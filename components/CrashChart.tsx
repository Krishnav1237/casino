"use client"

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
  BarElement,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend, BarElement)

interface CrashChartProps {
  history: number[]
  crashPoint?: number | null
  height?: number
  width?: number
  revealCrash?: boolean
}

export default function CrashChart({ history, crashPoint, height = 200, width = 560, revealCrash = false }: CrashChartProps) {
  const labels = useMemo(() => history.map((_, i) => i.toString()), [history])

  const maxVal = Math.max(...history, 1)

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Multiplier',
        data: history,
        fill: true,
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height)
          gradient.addColorStop(0, 'rgba(74,222,128,0.12)')
          gradient.addColorStop(1, 'rgba(74,222,128,0.02)')
          return gradient
        },
        borderColor: '#16a34a',
        tension: 0.25,
        pointRadius: 2,
        borderWidth: 3.2,
      }
    ]
  }), [labels, history])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        display: false,
      },
      y: {
        min: 1,
        max: Math.max(2, Math.ceil(maxVal)),
        ticks: { color: '#cbd5e1' },
        grid: {
          display: true, 
          color: 'rgba(255, 255, 255, 0.2)',
          lineWidth: 1,           
          borderDash: [5, 5],  
          drawOnChartArea: true    
        }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y}x`
        }
      }
    },
    elements: {
      point: { radius: 2 }
    }
  }), [maxVal])

  // plugin to draw crash vertical line when revealCrash is true and crashPoint is provided
  const crashPlugin = useMemo(() => {
    const reveal = Boolean((revealCrash))
    return {
      id: 'crashLine',
      afterDatasetsDraw: (chart: any) => {
        if (!crashPoint || !reveal) return

        const idx = history.findIndex(v => v >= (crashPoint || 0))
        if (idx < 0) return

        const xScale = chart.scales.x
        const yScale = chart.scales.y
        const x = xScale.getPixelForValue(idx)

        const ctx = chart.ctx
        ctx.save()
        ctx.strokeStyle = 'rgba(248,113,113,0.9)'
        ctx.setLineDash([6, 4])
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, yScale.top)
        ctx.lineTo(x, yScale.bottom)
        ctx.stroke()
        ctx.restore()
      }
    }
  }, [crashPoint, history, revealCrash])


  // draw crash line overlay using plugin option in options

  return (
    <div style={{ height, width }}>
      <Line
        data={data as any}
        options={options as any}
        plugins={[crashPlugin as any]}
      />
    </div>
  )
}
