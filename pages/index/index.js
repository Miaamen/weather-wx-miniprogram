var util = require('../../utils/util.js');
import *as echarts from "../../ec-canvas/echarts"

var hourlyTime = [];
var tempLine = [];
var option = {
  title: {
    text: '未来24小时的气温变化',
    left: 'center',
    textStyle: {
      //文字颜色
      color: '#8f8f8f',
      //字体风格,'normal','italic','oblique'
      fontStyle: 'normal',
      //字体系列
      fontFamily: 'sans-serif',
      //字体大小
      fontSize: 12
    }
  },
  xAxis: {
    type: 'category',
    data: [],
    boundaryGap: false,
    axisPointer: {
      type: 'shadow'
    },
    axisLabel: {
      interval: 0
    }
  },
  yAxis: {
    show: false,
    type: 'value'
  },
  series: [{
    data: [],
    type: 'line',
    itemStyle: { 
      normal: { 
        color: "#8d83c3",
        label: { 
          show: true 
        } 
      } 
    },
    lineStyle: {
      normal:{
        color: "#8d83c3"
      }
    },
    markLine: {
      silent: true,
      symbol: 'none',
      label: {
        show: false
      },
      data: [{
        xAxis: 0
      }, {
        xAxis: 1
      }, {
        xAxis: 2
      }, {
        xAxis: 3
      }, {
        xAxis: 4
      }, {
        xAxis: 5
      }, {
        xAxis: 6
      }, {
        xAxis: 7
      }],
      lineStyle: {
        normal: {
          type: 'dotted',
          color: 'rgb(222, 221, 240)'
        },
      }
    }
  }]
};
var chart;
function initChart(canvas, width, height) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  chart.setOption(option);
  return chart;
}

var app = getApp();
Page({
  data: {
    temp: null,
    cond: null,
    condCode: null,
    day: '24时预报',
    week: '周日',
    oneTap: '24时预报',
    twoTap: '7日预报',
    sunRaise: '日出',
    sunRaiseTime: '7:00',
    sunDown: '日落',
    sunDownTime:'19:00',
    humidity: '空气湿度',
    humNum: '50%',
    cloths: '穿衣指数', 
    clothsText: '热',
    cold: '感冒指数',
    coldText: '易发',
    wind: '西南风',
    windNum: '2级',
    ec: {
      onInit: initChart
    }
  },
  onLoad: function(){
    var that = this;
    // 调用函数时，传入new Date()参数，返回值是日期和时间 -- 用来确定是否夜晚
    var time = util.formatTime(new Date());
    // 再通过setData更改Page()里面的data，动态更新页面的数据、
    that.setData({
      time: time.substring(11, 13)
    });
    that.getLocation();
    that.setFont();
    that.setWidthAndHeight();
  },
  //返回页面的宽度，用来预报部分确保一次展示四个view
  setWidthAndHeight: function(){
    var that = this;
    var h;
    var query = wx.createSelectorQuery();
    //选择id
    query.select('.hour-temp').boundingClientRect()
    query.exec(function (res) {
      //res就是 所有标签为mjltest的元素的信息 的数组
      h = (wx.getSystemInfoSync().windowHeight);
      console.log(res[0].height);
      console.log(h)
      that.setData({
        height: h + 'px'
      })
    })
    var w = ((wx.getSystemInfoSync().windowWidth) - 20) / 4;
    console.log(w + "and" + h);
    that.setData({
      width: w + 'px',
      height: h + 'px'
    })
  },
  setFont: function(){
    wx.loadFontFace({
      family: 'Bitstream Vera Serif Bold',
      source: 'url("https://sungd.github.io/Pacifico.ttf")'
    })
  },
  //获得当时地点
  getLocation: function(){
    var that = this;
    wx.getLocation({
      type: '',
      altitude: true,
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.getCity(latitude,longitude);
      },
      fail: function(res) {
        alert('获取地理位置失败，请重新打开')
      }
    })
  },
  //获取城市信息
  getCity: function (latitude, longitude) {
    var that = this
    var url = "https://api.map.baidu.com/reverse_geocoding/v3/";
    var params = {
      ak: "rbbBXYzlxPGILiZruB6Ku9ic8wUxG6oO",

      output: "json",
      location: latitude + "," + longitude
    }
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        var city = res.data.result.addressComponent.city;
        console.log(city + "ss")
        var street = res.data.result.addressComponent.street;
        that.setData({
          city: city,
          street: street
        })

        var descCity = city.substring(0, city.length - 1);
        that.getWeahter(descCity);
        that.gethourlyWeather(descCity);
        that.getSevenDayWeather(descCity);
        that.getCloths(descCity);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //获取现在天气
  getWeahter: function (city) {
    var that = this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?key=d2cfafe985cb4aee9beecd5ea031a685&location=' + city,
      success: function (res) {
        console.log(res)
        that.setData({
          temp: res.data.HeWeather6[0].now.tmp,
          cond: res.data.HeWeather6[0].now.cond_txt,
          condCode: parseInt(res.data.HeWeather6[0].now.cond_code),
          wind: res.data.HeWeather6[0].now.wind_dir,
          windNum: res.data.HeWeather6[0].now.wind_sc + '级',
          humNum: res.data.HeWeather6[0].now.hum + '%'
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  changeDays: function(event){
    this.setData({
      day: event.target.dataset.day
    })
  },
  //获取24小时天气预报
  gethourlyWeather: function(city){
    var that = this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/hourly?key=d2cfafe985cb4aee9beecd5ea031a685&location=' + city,
      success: function (res) {
        var arr = res.data.HeWeather6[0].hourly;
        console.log(arr)
        var hourly = []
        for (var i = 0; i < arr.length; i++) {
          hourly[i] = {
            "imgsrc": arr[i].cond_code,
            "temp": arr[i].tmp,
            "time": arr[i].time.substring(11)
          }
          hourlyTime[i] = arr[i].time.substring(11);
          tempLine[i] = arr[i].tmp;
        }
        console.log(tempLine)
        var option = {
          xAxis: {
            data: hourlyTime
          },
          series: [{
            data: tempLine,
          }]
        }
        chart.setOption(option);


        that.setData({
          hourly: hourly
        })
      }
    })
  },
  //获取7天天气预报
  getSevenDayWeather: function (city) {
    var day = ['今天','明天','后天'];
    var week = ['星期一', '星期二' , '星期三', '星期四', '星期五', '星期六', '星期日'];
    var that = this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/forecast?key=d2cfafe985cb4aee9beecd5ea031a685&location=' + city,
      success: function (res) {
        var arr = res.data.HeWeather6[0].daily_forecast
        console.log(arr)
        var daily_forecast = []
        
        for (var i = 0; i < arr.length; i++) {
          daily_forecast[i] = {
            d_date: arr[i].date.substring(5),
            imgsrc: arr[i].cond_code_d,
            maxTemp: arr[i].tmp_max,
            minTemp: arr[i].tmp_min
          }
        }
        daily_forecast[0].d_date = '今天';
        daily_forecast[1].d_date = '明天';
        daily_forecast[2].d_date = '后天';
        that.setData({
          daily_forecast: daily_forecast,
          sunDownTime: arr[0].ss,
          sunRaiseTime: arr[0].sr
        })
      }
    })
  },
  getCloths: function (city) {
    var that = this;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/lifestyle?key=d2cfafe985cb4aee9beecd5ea031a685&location=' + city,
      success: function (res) {
        var arr = res.data.HeWeather6[0].lifestyle
        console.log(arr);
        that.setData({
          clothsText: arr[1].brf,
          coldText: arr[2].brf
        })
      }
    })
  },
  changePosition: function(){
    console.log("position")
    wx.navigateTo({
      url: '../position/position',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
          console.log(data)
        },
        someEvent: function (data) {
          console.log(data)
        }
    },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
      }
    })
  },
  setCity: function(city){
    var that = this;
    var city = city + "市";
    var descCity = city.substring(0, city.length - 1);
    that.getWeahter(descCity);
    that.gethourlyWeather(descCity);
    that.getSevenDayWeather(descCity);
    that.getCloths(descCity)
  }

})
