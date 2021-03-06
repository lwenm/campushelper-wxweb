var util = require('../../../utils/util.js');
var check = require('../../../utils/check.js');
var api = require('../../../config/api.js');

var app = getApp();

Page({
  data: {
    content: '',
    contentLength: 0,
    title: '',
    picUrl: '',
    files: [],
    hasPicture: false
  },
  chooseImage: function (e) {
    if (this.data.files.length > 1) {
      util.showErrorToast('只能上传1张图片')
      return false;
    }

    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          files: res.tempFilePaths
        });
        that.upload(res);
      }
    })
  },

  upload: function (res) {
    var that = this;
    const uploadTask = wx.uploadFile({
      url: api.ImageUpload,
      filePath: res.tempFilePaths[0],
      name: 'file',
      success: function (res) {
        var _res = JSON.parse(res.data);
        if (_res.url != null) {
          that.setData({
            hasPicture: true,
            picUrl: _res.url
          })
        }
      },
      fail: function (e) {
        wx.showModal({
          title: '错误',
          content: '上传失败',
          showCancel: false
        })
      },
    })

    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress)
      console.log('已经上传的数据长度', res.totalBytesSent)
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })

  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },


  //输入内容函数
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    });
  },

  contactInput: function (e) {
    this.setData({
      contact: e.detail.value
    });
  },

  titleInput: function (e) {
    this.setData({
      title: e.detail.value
    });
  },

  contentInput: function (e) {
    this.setData({
      contentLength: e.detail.cursor,
      content: e.detail.value,
    });
  },

  cleartitle: function (e) {
    this.setData({
      title: ''
    });
  },

  clearContact: function (e) {
    this.setData({
      contact: ''
    });
  },

  submitFeedback: function (e) {

    let that = this;

    if (that.data.content == '') {
      util.showErrorToast('请输入内容');
      return false;
    }

    if (that.data.picUrl == '') {
      util.showErrorToast('请上传新闻图片');
      return false;
    }

    if (that.data.title == '') {
      util.showErrorToast('标题');
      return false;
    }


    wx.showLoading({
      title: '提交中...',
      mask: true,
      success: function () {

      }
    });

    util.request(api.AddCampus, {
      userId: wx.getStorageSync('userInfo').uid,
      title: that.data.title,
      content: that.data.content,
      picUrl: that.data.picUrl
    }, 'POST').then(function (res) {
      wx.hideLoading();
      wx.navigateBack({
      })
    });
  },
  onLoad: function (options) {

  },
  onReady: function () {

  },
  onShow: function () {
    if (wx.getStorageSync('userInfo') != '')
      app.globalData.hasLogin = true;
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    if (wx.getStorageSync('userInfo').rid != 2){
      wx.showToast({
        title: '未有发布权限',
        icon: 'none',
        duration: 1000
      })
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/addInfo/addInfo',
        }) 
      }, 1000)
    }
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  }
})