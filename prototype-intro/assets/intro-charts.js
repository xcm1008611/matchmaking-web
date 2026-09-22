// 缘境原型介绍图表
(function () {
  var style = getComputedStyle(document.documentElement)
  var accent = style.getPropertyValue('--accent').trim()
  var accent2 = style.getPropertyValue('--accent2').trim()
  var ink = style.getPropertyValue('--ink').trim()
  var muted = style.getPropertyValue('--muted').trim()
  var rule = style.getPropertyValue('--rule').trim()

  // --- Chart: 结婚登记对数变化 ---
  var el = document.getElementById('chart-marriage')
  if (el) {
    var chart = echarts.init(el, null, { renderer: 'svg' })
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: 56, right: 24, top: 30, bottom: 36 },
      xAxis: {
        type: 'category',
        data: ['2013', '2015', '2017', '2019', '2021', '2023', '2024', '2025'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      yAxis: {
        type: 'value',
        name: '万对',
        nameTextStyle: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      series: [{
        type: 'bar',
        data: [1346.9, 1224.7, 1063.1, 947.1, 763.6, 768.0, 610.6, 676.3],
        barWidth: 34,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: accent2 }, { offset: 1, color: accent }]
          }
        },
        label: { show: true, position: 'top', color: ink, fontSize: 11 }
      }]
    })
    window.addEventListener('resize', function () { chart.resize() })
  }
})()
