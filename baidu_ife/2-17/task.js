/**
 * Created by hansneil on 21/3/16.
 */
/* 数据格式演示
 var aqiSourceData = {
 "北京": {
 "2016-01-01": 10,
 "2016-01-02": 10,
 "2016-01-03": 10,
 "2016-01-04": 10
 }
 };
 */

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date("2016-01-01");
    var datStr = '';
    for (var i = 1; i < 92; i++) {
        datStr = getDateStr(dat);
        returnData[datStr] = Math.ceil(Math.random() * seed);
        dat.setDate(dat.getDate() + 1);
    }
    return returnData;
}

var aqiSourceData = {
    "北京": randomBuildData(500),
    "上海": randomBuildData(300),
    "广州": randomBuildData(200),
    "深圳": randomBuildData(100),
    "成都": randomBuildData(300),
    "西安": randomBuildData(500),
    "福州": randomBuildData(100),
    "厦门": randomBuildData(100),
    "沈阳": randomBuildData(500)
};

var colors = ['#16324a', '#24385e', '#393f65', '#4e4a67', '#5a4563', '#b38e95',
              '#edae9e', '#c1b9c2', '#bec3cb', '#9ea7bb', '#99b4ce', '#d7f0f8'];

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
    nowSelectCity: -1,
    nowGraTime: "day"
}

function getWidth(width, len) {
    var posObj = {};
    posObj.width = Math.floor(width / (len*2));
    posObj.left = Math.floor(width / len);
    posObj.offsetLeft = (width - posObj.left * (len - 1) - posObj.width) / 2;
    return posObj;
}

/**
 * addEventHandler方法
 * 跨浏览器实现事件绑定
 */
function addEventHandler(ele, event, hanlder) {
    if (ele.addEventListener) {
        ele.addEventListener(event, hanlder, false);
    } else if (ele.attachEvent) {
        ele.attachEvent("on"+event, hanlder);
    } else  {
        ele["on" + event] = hanlder;
    }
}

/**
 * 渲染图表
 */
function renderChart() {
    var innerHTML = "", i = 0;
    var wrapper = document.getElementById("aqi-chart-wrap");
    var width = wrapper.clientWidth;
    var selectedData = chartData[pageState.nowGraTime][pageState.nowSelectCity];
    var len = Object.keys(selectedData).length;
    var posObj = getWidth(width, len);
    for (var key in selectedData) {
        innerHTML += "<div class='aqi-bar " + pageState.nowGraTime + "' style='height:" + selectedData[key] + "px; width: " + posObj.width +"px; left:" + (posObj.left * (i++) + posObj.offsetLeft) + "px; background-color:" + colors[Math.floor(Math.random() * 11)] + "'></div>"
    }
    wrapper.innerHTML = innerHTML;
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(radio) {
    // 确定是否选项发生了变化
    var value = radio.value;
    var item = radio.previousElementSibling;
    var items = document.getElementsByTagName('span');
    for (var i = 0; i < items.length; i++) {
        items[i].className = "";
    }
    item.className = "selected";
    if (value !== pageState.nowGraTime) {
        // 设置对应数据
        pageState.nowGraTime = value;
        // 调用图表渲染函数
        renderChart();
    }
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
    // 确定是否选项发生了变化
    var city = this.value;
    if (city !== pageState.nowSelectCity) {
        // 设置对应数据
        pageState.nowSelectCity = city;
        // 调用图表渲染函数
        renderChart();
    }
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
    var radio = document.getElementsByName('gra-time');
    for (var i = 0; i < radio.length; i++) {
        (function (m) {
            addEventHandler(radio[m], 'click', function () {
                graTimeChange(radio[m])
            })
        })(i);
    }
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    var select = document.getElementById("city-select");
    var cityArr = Object.getOwnPropertyNames(aqiSourceData);
    var htmlArr = cityArr.map(function(item) {
        return "<option>" + item + "</option>";
    });
    pageState.nowSelectCity = cityArr[0];
    select.innerHTML = htmlArr.join("");
    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    addEventHandler(select, 'change', citySelectChange);

}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    var week = {}, count = 0, singleWeek = {},
        month = {}, mcount = 0, singleMonth = {};
    for (var key in aqiSourceData) {
        var tempCity = aqiSourceData[key]
        var keyArr = Object.getOwnPropertyNames(tempCity);
        var tempMonth = keyArr[0].slice(5, 7);
        for (var i = 0; i < keyArr.length; i++) {
            count += tempCity[keyArr[i]];
            mcount += tempCity[keyArr[i]];
            if (i != 0 && i % 7 == 0) {
                var tempKey = keyArr[i].slice(0, 4) + "-" + i / 7;
                singleWeek[tempKey] = Math.floor(count / 7);
                count = 0;
            }
            if (keyArr[i].slice(5, 7) !== tempMonth || i == keyArr.length - 1) {
                tempMonth = keyArr[i].slice(5, 7);
                var tempMKey = keyArr[i-1].slice(0, 7);
                var tempDays = (i == keyArr.length - 1) ? keyArr[i].slice(-2) : keyArr[i-1].slice(-2);
                singleMonth[tempMKey] = Math.floor(mcount / tempDays);
                mcount = 0;
            }
        }
        week[key] = singleWeek;
        month[key] = singleMonth;
        singleWeek = {};
        singleMonth = {};
    }
    // 处理好的数据存到 chartData 中
    chartData.day = aqiSourceData;
    chartData.week = week;
    chartData.month = month;
    renderChart();
}

/**
 * 初始化函数
 */
function init() {
    initGraTimeForm();
    initCitySelector();
    initAqiChartData();
}

init();
