// 报价方案图表
(function () {
  var style = getComputedStyle(document.documentElement)
  var accent = style.getPropertyValue('--accent').trim()
  var accent2 = style.getPropertyValue('--accent2').trim()
  var teal = style.getPropertyValue('--teal').trim()
  var ink = style.getPropertyValue('--ink').trim()
  var muted = style.getPropertyValue('--muted').trim()
  var rule = style.getPropertyValue('--rule').trim()
  var bg2 = style.getPropertyValue('--bg2').trim()

  // --- Chart: 市场规模 ---
  var market = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' })
  market.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 48, right: 24, top: 30, bottom: 36 },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '亿元',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [75, 83, 93.8, 98, 103.5],
      barWidth: 42,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: accent2 }, { offset: 1, color: accent }]
        }
      },
      label: { show: true, position: 'top', color: ink, fontSize: 13 }
    }]
  })
  window.addEventListener('resize', function () { market.resize() })

  // --- Chart: 工作量分布 ---
  var workload = echarts.init(document.getElementById('chart-workload'), null, { renderer: 'svg' })
  workload.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    legend: { bottom: 0, textStyle: { color: muted } },
    color: [accent, accent2, teal, '#8D8998', '#D9A441'],
    series: [{
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '44%'],
      data: [
        { name: '需求分析 14.25%', value: 14.25 },
        { name: '系统设计 12.38%', value: 12.38 },
        { name: '编码构建 39.56%', value: 39.56 },
        { name: '测试验收 23.01%', value: 23.01 },
        { name: '实施交付 10.80%', value: 10.80 }
      ],
      label: { color: ink, fontSize: 12, formatter: '{b}' },
      itemStyle: { borderColor: bg2, borderWidth: 2 }
    }]
  })
  window.addEventListener('resize', function () { workload.resize() })
})()
