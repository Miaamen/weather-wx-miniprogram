//先引用城市数据文件
var city = require('../../utils/city.js');

var lineHeight = 0;
var endWords = "";
var isNum;
Page({
  data: {
    isShow: false,
    isHidden: false,
    cityName: "", //获取选中的城市名

  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载3
    this.getLocation();
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
    var cityChild = city.City[0];
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        lineHeight = (res.windowHeight - 100) / 22;
        console.log(res.windowHeight - 100)
        that.setData({
          city: cityChild,
          winHeight: res.windowHeight - 40,
          lineHeight: lineHeight
        })
      }
    })
  },
  onShow: function () {
    // 生命周期函数--监听页面显示

  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  //触发全部开始选择
  chStart: function () {
    this.setData({
      trans: ".3",
      hidden: false
    })
  },
  //触发结束选择
  chEnd: function () {
    this.setData({
      trans: "0",
      hidden: true,
      scrollTopId: this.endWords
    })
  },
  //获取文字信息
  getWords: function (e) {
    var id = e.target.id;
    this.endWords = id;
    isNum = id;
    this.setData({
      showwords: this.endWords
    })
  },
  //设置文字信息
  setWords: function (e) {
    var id = e.target.id;
    this.setData({
      scrollTopId: id
    })
  },

  // 滑动选择城市
  chMove: function (e) {
    var y = e.touches[0].clientY;
    var offsettop = e.currentTarget.offsetTop;
    var height = 0;
    var that = this;
    ;
    var cityarr = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"]
    // 获取y轴最大值
    wx.getSystemInfo({
      success: function (res) {
        height = res.windowHeight - 10;
      }
    });

    //判断选择区域,只有在选择区才会生效
    if (y > offsettop && y < height) {
      // console.log((y-offsettop)/lineHeight)
      var num = parseInt((y - offsettop) / lineHeight);
      endWords = cityarr[num];
      // 这里 把endWords 绑定到this 上，是为了手指离开事件获取值
      that.endWords = endWords;
    };


    //去除重复，为了防止每次移动都赋值 ,这里限制值有变化后才会有赋值操作，
    //DOTO 这里暂时还有问题，还是比较卡，待优化
    if (isNum != num) {
      // console.log(isNum);
      isNum = num;
      that.setData({
        showwords: that.endWords
      })
    }
  },
  //选择城市，并让选中的值显示在文本框里
  bindCity: function (e) {
    console.log(e);
    var cityName = e.currentTarget.dataset.city;
    this.setData({ cityName: cityName })
    //wx.navigateBack({
    //})
    var that = this;
    var pages = getCurrentPages(); 
    var prevPage = pages[pages.length - 2]; // 上一个页面
    //console.log(prevPage.data)
    prevPage.setData({
      city: cityName,
      street: null
    })
    prevPage.setCity(cityName);
    wx.navigateBack({})
  },
  handleInput(event) {  // 输入框输入或改变事件
    let value = event.detail.value  // 获取输入框中的值
    let list = []  // 临时变量
    this.setData({
      isHidden: false,
      isShow: true  // 显示
    })
    if (value == '') {  // 如果清空输入框
      this.setData({
        isShow: false,  // 隐藏
        searchCitys: []  // 清空搜索结果
      })
      return   // 不再往下执行(重要!)
    }

    var array = city.City[0];
    console.log(array)

    for (let k in city.City[0]) {  // 进行匹配，city就是全部城市数据
      city.City[0][k].forEach((item) => {
        if (item.name.indexOf(value) != -1) {
          list.push(item);
        }
      })
    }
    
    this.setData({
      searchCitys: list  // 赋值
    })
  },
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: '',
      altitude: true,
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.getCity(latitude, longitude);
      },
      fail: function (res) {
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
        that.setData({
          currCity: city
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})