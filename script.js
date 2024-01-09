//定義數據映射對象
const regionMapping = {
  "上海电信": "上海",
  "贵州电信": "貴州",
  "江苏电信": "江蘇",
  "甘肃电信": "甘肅",
  "陕西电信": "陝西",
  "天津电信": "天津",
  "河南电信": "河南",
  "浙江电信": "浙江",
  "江西电信": "江西",
  "福建电信": "福建",
  "黑龙江电信": "黑龍江",
  "广西电信": "廣西",
  "广东电信": "廣東",
  "辽宁电信": "遼寧",
  "吉林电信": "吉林",
  "河北电信": "河北",
  "内蒙电信": "內蒙古",
  "湖南电信": "湖南",
  "湖北电信": "湖北",
  "山东电信": "山東",
  "四川电信": "四川",
  "北京电信": "北京",
  "山西电信": "山西",
  "青海电信": "青海",
  "云南电信": "雲南",
  "新疆电信": "新疆",
  "重庆电信": "重慶",
  "宁夏电信": "寧夏",
  "安徽电信": "安徽",
  "西藏电信": "西藏",
  "上海联通": "上海",
  "贵州联通": "貴州",
  "江苏联通": "江蘇",
  "甘肃联通": "甘肅",
  "陕西联通": "陝西",
  "天津联通": "天津",
  "河南联通": "河南",
  "浙江联通": "浙江",
  "江西联通": "江西",
  "福建联通": "福建",
  "黑龙江联通": "黑龍江",
  "广西联通": "廣西",
  "广东联通": "廣東",
  "辽宁联通": "遼寧",
  "吉林联通": "吉林",
  "河北联通": "河北",
  "内蒙联通": "內蒙古",
  "湖南联通": "湖南",
  "湖北联通": "湖北",
  "山东联通": "山東",
  "四川联通": "四川",
  "北京联通": "北京",
  "山西联通": "山西",
  "青海联通": "青海",
  "云南联通": "雲南",
  "新疆联通": "新疆",
  "重庆联通": "重慶",
  "宁夏联通": "寧夏",
  "安徽联通": "安徽",
  "西藏联通": "西藏",
  "上海移动": "上海",
  "贵州移动": "貴州",
  "江苏移动": "江蘇",
  "甘肃移动": "甘肅",
  "陕西移动": "陝西",
  "天津移动": "天津",
  "河南移动": "河南",
  "浙江移动": "浙江",
  "江西移动": "江西",
  "福建移动": "福建",
  "黑龙江移动": "黑龍江",
  "广西移动": "廣西",
  "广东移动": "廣東",
  "辽宁移动": "遼寧",
  "吉林移动": "吉林",
  "河北移动": "河北",
  "内蒙移动": "內蒙古",
  "湖南移动": "湖南",
  "湖北移动": "湖北",
  "山东移动": "山東",
  "四川移动": "四川",
  "北京移动": "北京",
  "山西移动": "山西",
  "青海移动": "青海",
  "云南移动": "雲南",
  "新疆移动": "新疆",
  "重庆移动": "重慶",
  "宁夏移动": "寧夏",
  "安徽移动": "安徽",
  "西藏移动": "西藏"
};


//建立d3 SVG 元素
let container = d3.select(".map-container");
let width = container.node().getBoundingClientRect().width;
let height = container.node().getBoundingClientRect().height;

const svg = container
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

let scale = Math.min(width, height) * 1;
const projection = d3.geoMercator()
  .translate([width / 2, height / 2])
  .center([101, 38])
  .scale(scale);

const path = d3.geoPath().projection(projection);

//導入中國地圖geojson
fetch('/Boce/china.json')
  .then(response => response.json())
  .then(json => {
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", 'rgb(120, 120, 120)')  // 預設地圖顏色
      .attr("original-color", 'rgb(120, 120, 120)')  // 儲存預設顏色
      
      .on('mouseover', function(event, data) {
        // 滑鼠懸停區域時顯示顏色
        d3.select(this).attr('fill', 'rgb(38, 85, 189)');
      })
      .on('mouseout', function(event, data) {
        // 恢復為目前顏色或原始顏色
        let currentColor = d3.select(this).attr("current-color");
        let originalColor = d3.select(this).attr("original-color");
        d3.select(this).attr('fill', currentColor || originalColor);
      })
      .attr('stroke', 'rgba(255,255,255,1)')
      .attr('stroke-width', 1);

    // 省份名稱
    svg.selectAll("text.region-name")
      .data(json.features)
      .enter()
      .append("text")
      .attr("class", "region-name")
      .attr("transform", d => {
        const cp = d.properties.cp;
        const projectedCp = projection(cp);
        return `translate(${projectedCp[0]}, ${projectedCp[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", () => Math.min(width, height) / 50 + "px")
      .attr("fill", "white")
      .text(d => d.properties.name);
  });

// 處理視窗大小調整
window.addEventListener("resize", function() {
  let newWidth = container.node().getBoundingClientRect().width;
  let newHeight = container.node().getBoundingClientRect().height;

  // 更新SVG大小
  svg.attr("width", newWidth)
     .attr("height", newHeight);

  projection.translate([newWidth / 2, newHeight / 2])
            .scale();

  // 更新區域字型大小
  svg.selectAll("path").attr("d", path);
  svg.selectAll("text.region-name").attr("transform", function(d) {
    const cp = d.properties.cp;
    const projectedCp = projection(cp);
    return `translate(${projectedCp[0]}, ${projectedCp[1]})`;
  });
});

// 根據時間範圍來轉換地圖顏色
function getColorByTime(timeTotal) {
  let time = parseFloat(timeTotal);
  if (isNaN(time)) return '#dddddd'; // 如果時間無效，返回灰色
  if (time === 0) return '#E0414C';  //紅色
  if (time < 1.5) return "#6ECC50";  //淺綠色
  else if (time < 2.5) return "#ACD357";  //深綠色
  else if (time < 3.5) return "#F9C764";  //黃色
  else if (time < 4.5) return "#FF9545";  //橘色
  else return "#E0414C"; //紅色
}

document.querySelector('form').addEventListener('submit', function(e) {
  // 顯示檢測框
  var myModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  myModal.show();

  let isChecking = true;

  // 設定一個定時器來檢查後端是否完成了處理
  let checkInterval = setInterval(function() {
    if (!isChecking) {
      clearInterval(checkInterval); // 如果還沒有開始偵測，則停止定時器
      return;
    }
    fetch('/Boce/get-results')
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          clearInterval(checkInterval); // 清除定時器
          myModal.hide(); // 隐藏檢測框
          updateMapWithResults(data); // 更新结果表格
          isChecking = false; // 檢測结束
        }
      })
      .catch(error => {
        console.error('Error fetching results:', error);
      });
  }, 31000);
});
//獲取api結果並重新渲染地圖
function updateMapWithResults(results) {
  console.log('Updating map with results:', results);
  if (!Array.isArray(results)) {
    console.error('Results are not an array:', results);
    return;
  }

// 創建 tooltip 元素
const tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("background-color", "rgba(200, 200, 200, 0.7)")
.style("padding", "5px")
.style("border-radius", "5px")
.style("pointer-events", "none")
.style("font-size", "12px")
.style("z-index", "999")
.style("opacity", 0);

results.forEach(result => {
let regionName = regionMapping[result.node_name] || result.node_name;
let timedelay = regionMapping[result.time_total] || result.time_total;
let color = getColorByTime(result.time_total);

d3.selectAll("path")
  .filter(function(d) { return d.properties.name === regionName; })
  .attr("fill", color)
  .attr("current-color", color)
  .on('mouseover', function(d) {
    // 滑鼠停滯時更新 tooltip 內容和位置
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html("地區: " + regionName + "<br/>總時間: " + timedelay)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    d3.select(this).attr('fill', 'rgb(38, 85, 189)');
  })
  .on('mouseout', function(d) {
    // 滑鼠離開時隐藏 tooltip
    tooltip.transition().duration(500).style("opacity", 0);
    let currentColor = d3.select(this).attr("current-color");
    let originalColor = d3.select(this).attr("original-color");
    d3.select(this).attr('fill', currentColor || originalColor);
  })

    .on('mousemove', function(event, data) {
      const [mouseX, mouseY] = d3.mouse(document.body);
      const xOffset = 10; // X軸方向的偏移
      const yOffset = 10; // Y軸方向的偏移

      // 設定小灰框位置保持在鼠标的右下角，並加入固定偏移值
      tooltip.style("left", (mouseX + xOffset) + "px")
        .style("top", (mouseY + yOffset) + "px");
      });
  });
}
