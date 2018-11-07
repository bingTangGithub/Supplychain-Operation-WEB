const initialState = {
  loading: false,
  values: {
    frontCateImg: [],
  },
  backCateList: [], // 分类列表
  checkedBackCateList: [],
  spuItemList: [],
  baseInfoList: [
    {
      formItemCfg: { label: '分类名称', id: 'frontCateName' },
      // 写给getFieldDecorator的options
      fieldOpt: {
        rules: [
          { required: true, message: '必填' },
          { max: 12, message: '请输入长度小于12的文字' },
        ],
      },
      // input的类型(input,select,checkbox等)，及属性
      inputOpt: { type: 'input', props: { placeholder: '请输入商品名称' } },
    }, {
      formItemCfg: { label: '排序', id: 'sort' },
      fieldOpt: {
        initialValue: '50',
        rules: [
          { required: true, message: '必填' },
          { pattern: /^(100|[1-9]\d?)$/, message: '请输入1-100的整数' },
        ],
      },
      inputOpt: { type: 'input', props: { placeholder: '请输入排序' } },
    },
  ],
  frontCateImg: {
    formItemCfg: {
      label: '分类图片',
      id: 'frontCateImg',
      extra: '支持JPG、PNG、GIF、JPEG格式，大小在5M以内',
    },
    inputOpt: {
      type: 'imgUpload',
      getProps: (__props) => ({
        fileList: __props.values.frontCateImg,
        onChange: __props.handleImgChange,
        length: 1,
        clearfix: true,
      }),
    },
  },
  extraInfoList: [
    {
      formItemCfg: { label: '图片链接', id: 'frontCateImgTarget' },
      fieldOpt: {
        rules: [
          { max: 64, message: '请输入长度小于64的链接地址' },
        ],
      },
      inputOpt: { type: 'input', props: { placeholder: '请输入图片链接' } },
    },
  ],
  backCateInfo: {
    formItemCfg: {
      label: '关联后端分类',
      id: 'backCateList',
    },
  },
  spuItemsInfo: {
    formItemCfg: {
      label: '添加商品',
      id: 'spuItemsInfo',
    },
  },
  goodsModalVisible: false,
  goodsModal: {
    tempSpuItemList: [],
    loading: false,
    data: [],
    page: {
      pageSize: 10,
      count: 0,
      pageNo: 1,
    },
    searchParams: {
      pageNo: 1,
      pageSize: 10,
      spuId: '',
      spuName: '',
      inFrontCate: '',
    },
    modalShow: false,
    rowKey: 'id',
  },
};
export default initialState;
