// SmartCall 报价方案图表
(function () {
  var style = getComputedStyle(document.documentElement)
  var accent = style.getPropertyValue('--accent').trim()
  var accent2 = style.getPropertyValue('--accent2').trim()
  var teal = style.getPropertyValue('--teal').trim()
  var gold = style.getPropertyValue('--gold').trim()
  var ink = style.getPropertyValue('--ink').trim()
  var muted = style.getPropertyValue('--muted').trim()
  var rule = style.getPropertyValue('--rule').trim()
  var bg2 = style.getPropertyValue('--bg2').trim()

  // --- Chart 1: 工作量分布 ---
  var workload = echarts.init(document.getElementById('chart-workload'), null, { renderer: 'svg' })
  workload.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    legend: { bottom: 0, textStyle: { color: muted } },
    color: [accent, accent2, teal, '#8D8998', gold],
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

  // --- Chart 2: 用量成本构成 ---
  var usage = echarts.init(document.getElementById('chart-usage'), null, { renderer: 'svg' })
  usage.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 60, right: 24, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['线路分钟', 'ASR 转写', 'TTS 合成', 'LLM Token', '存储带宽'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '元/月',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [2800, 76, 28, 200, 200],
      barWidth: 44,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: accent }, { offset: 1, color: accent2 }]
        }
      },
      label: { show: true, position: 'top', color: ink, fontSize: 12, formatter: function (p) { return p.value + ' 元' } }
    }]
  })
  window.addEventListener('resize', function () { usage.resize() })
})()
