import moment from 'moment';
// import ChinaArea from '../../../../../public/ChinaArea.json';

const initialState = {
  loading: false,
  submitValues: {},
  values: {
    headImageList: [],
    detailImageList: [],
  },
  cateList: [], // 分类列表
  // labelList: [], // 标签列表,
  tagList: [], // 标签列表,
  areaList: [{
    value: '100000',
    label: '全国',
    isLeaf: false,
  }], // 地区列表
  // areaList: ChinaArea, // 地区列表
  carriageList: [], // 物流方式
  specInfoList: [], // 规格勾选 + 规格值填写
  skuList: [], // SKU列表信息
  attributeList: [], // 其他属性列表信息
  varifyRecord: { // 提交审核信息
    verifyStatus: { value: '3' },
    reason: { value: undefined },
  },
  verifyLoading: false,
  baseInfoList: [
    { // 商品名称
      // 写给FormItem标签的属性
      formItemCfg: {
        label: '商品名称',
        id: 'name',
      },
      // 写给getFieldDecorator的options
      fieldOpt: {
        rules: [
          { required: true, message: '必填' },
          { max: 64, message: '请输入长度小于64的文字' },
        ],
      },
      // input的类型(input,select,checkbox等)，及属性
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入商品名称',
        },
      },
    }, { // 一句话描述
      formItemCfg: {
        label: '一句话描述',
        id: 'subHead',
      },
      fieldOpt: {
        rules: [
          { max: 64, message: '请输入长度小于64的文字' },
        ],
      },
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入一句话描述，即副标题',
        },
      },
    }, { // 商品性质
      formItemCfg: {
        label: '商品性质',
        id: 'standardFlag',
      },
      fieldOpt: {
        initialValue: '1',
        rules: [
          { required: true, message: '必选' },
        ],
      },
      inputOpt: {
        type: 'select',
        props: {
          placeholder: '请选择商品性质',
          data: [
            { value: '1', label: '标准商品（以售价结算）' },
            { value: '2', label: '非标准商品（以单价和重量结算）' },
          ],
        },
      },
    }, { // 商品单位
      formItemCfg: {
        label: '商品单位',
        id: 'unit',
      },
      fieldOpt: {
        initialValue: '斤',
        rules: [
          { max: 10, message: '请输入长度小于10的文字' },
        ],
      },
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入商品单位',
        },
      },
      judgeRequired: (__props) => __props.form.getFieldValue('standardFlag') === '2',
    }, { // 包装单位
      formItemCfg: {
        label: '包装单位',
        id: 'pkgUnit',
      },
      fieldOpt: {
        rules: [
          { required: true, message: '必填' },
          { max: 10, message: '请输入长度小于10的文字' },
        ],
      },
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入包装单位',
        },
      },
      // judgeRequired: (__props) => __props.form.getFieldValue('standardFlag') === '2',
    }, { // 分类
      allowEdit: false,
      formItemCfg: {
        label: '分类',
        id: 'categoryId',
      },
      fieldOpt: {
        rules: [
          { required: true, message: '必选' },
        ],
      },
      inputOpt: {
        type: 'cascader',
        getProps: (__props) => ({
          placeholder: '请选择商品分类',
          options: __props.cateList,
          loadData: __props.loadCateList,
          getPopupContainer: () => document.getElementById('product-detail-form'),
        }),
      },
    }, { // 商品编号
      formItemCfg: {
        label: '商品编号',
        id: 'spuNo',
      },
      fieldOpt: {
        rules: [
          { pattern: /^\d{0,30}$/, message: '请输入长度小于30的纯数字' },
        ],
      },
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入商品编号',
        },
      },
    }, { // 标签
      formItemCfg: {
        label: '标签',
        id: 'tagList',
      },
      fieldOpt: {
        rules: [
          // { required: true, message: '必填' },
        ],
      },
      inputOpt: {
        type: 'select',
        getProps: (__props) => ({
          mode: 'multiple',
          placeholder: '请选择标签',
          data: __props.tagList,
        }),
      },
    // }, { // 标签
    //   formItemCfg: {
    //     label: '标签',
    //     id: 'labelList',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       // { required: true, message: '必填' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'checkboxGroup',
    //     getProps: (__props) => ({
    //       options: __props.labelList,
    //     }),
    //   },
    }, { // 可售时间
      formItemCfg: {
        label: '可售时间',
        id: 'saleDate',
      },
      fieldOpt: {
        rules: [],
      },
      inputOpt: {
        type: 'rangePicker',
        props: {
          placeholder: ['起始时间', '结束时间'],
          showTime: {
            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
          },
          format: 'YYYY-MM-DD HH:mm:ss',
          getCalendarContainer: () => document.getElementById('product-detail-form'),
        },
      },
    // }, { // 可售范围
    //   formItemCfg: {
    //     label: '可售范围',
    //     id: 'saleArea',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       { required: true, message: '必选' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'radioGroup',
    //     props: {
    //       options: [
    //         { label: '全国', value: '0' },
    //         { label: '部分区域', value: '1' },
    //       ],
    //     },
    //   },
    // }, { // 可售区域
    //   // isShow: false,
    //   click2Edit: true,
    //   formItemCfg: {
    //     label: '可售区域',
    //     id: 'areaList',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       { required: true, message: '必选' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'treeSelect',
    //     getProps: (__props) => ({
    //       placeholder: '请选择可售区域',
    //       treeData: __props.areaList,
    //       loadData: __props.loadAreaList,
    //       filterTreeNode: false,
    //       treeCheckable: true,
    //       dropdownMatchSelectWidth: true,
    //       // treeNodeFilterProp: 'label',
    //       dropdownStyle: {
    //         maxHeight: 500,
    //       },
    //       getPopupContainer: () => document.getElementById('product-detail-form'),
    //     }),
    //   },
    },
  ],
  otherAttrList: [],
  saleRuleList: [
    {
      formItemCfg: {
        label: '操作状态',
        id: 'saleStatus',
      },
      fieldOpt: {
        rules: [
          { required: true, message: '必选' },
        ],
      },
      inputOpt: {
        type: 'radioGroup',
        props: {
          options: [
            { label: '立即上架', value: '0' },
            { label: '暂不上架', value: '1' },
          ],
        },
      },
    // }, { // 起售数量
    //   formItemCfg: {
    //     label: '起售数量',
    //     id: 'minBuyNum',
    //     extra: '设置起售数量2，商品必须2件起卖；非必填项，系统默认1',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       { pattern: /^\d+$/, message: '请输入数字' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'input',
    //     props: {
    //       placeholder: '请输入起售数量',
    //       // disabled: true,
    //     },
    //   },
    // }, { // 递加数量
    //   formItemCfg: {
    //     label: '递加数量',
    //     id: 'lotSize',
    //     extra: '设置递加数量3，前台每加1次购物车，商品数量增加3；非必填项，系统默认1',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       { pattern: /^\d+$/, message: '请输入数字' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'input',
    //     props: {
    //       placeholder: '请输入递加数量',
    //       // disabled: true,
    //     },
    //   },
    // }, { // 物流方式
    //   formItemCfg: {
    //     label: '物流方式',
    //     id: 'carriageId',
    //   },
    //   fieldOpt: {
    //     rules: [
    //       { required: true, message: '必选' },
    //     ],
    //   },
    //   inputOpt: {
    //     type: 'select',
    //     getProps: (__props) => ({
    //       placeholder: '请选择物流方式',
    //       data: __props.carriageList,
    //       onFocus: () => __props.loadCarriageList(),
    //       getPopupContainer: () => document.getElementById('product-detail-form'),
    //     }),
    //   },
    },
  ],
  detailList: [
    {
      formItemCfg: {
        label: '商品图片',
        id: 'headImageList',
        extra: '建议尺寸1080*720px，支持JPG、PNG、GIF、JPEG格式，大小在2M以内；最少1张；最多5张',
      },
      inputOpt: {
        type: 'imgUpload',
        getProps: (__props) => ({
          fileList: __props.values.headImageList,
          onChange: __props.handleImgListChange,
          length: 5,
          multiple: true,
          clearfix: true,
        }),
      },
    }, {
      formItemCfg: {
        label: '商品详情',
        id: 'detailImageList',
        extra: '建议尺寸1080*720px，支持JPG、PNG、GIF、JPEG格式，大小在2M以内；最少1张；最多10张',
      },
      inputOpt: {
        type: 'imgUpload',
        getProps: (__props) => ({
          fileList: __props.values.detailImageList,
          onChange: __props.handleImgListChange,
          length: 10,
          multiple: true,
          clearfix: true,
        }),
      },
    },
  ],
};
export default initialState;
