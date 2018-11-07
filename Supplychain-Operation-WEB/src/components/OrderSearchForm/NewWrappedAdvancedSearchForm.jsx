import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'antd';
import PropTypes from 'prop-types';
import { createFormItem, mapPropsToFields, onFieldsChange } from '../../components';
import './SearchForm.scss';

const FormItem = Form.Item;

class NewAdvancedSearchForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    search: PropTypes.func,
  };

  static defaultProps = {
    search: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {
      expand: document.body.clientWidth > 768,
    };

    this.responsiveHandler = ((e) => {
      if (e.matches) {
        this.setState({
          expand: false,
        });
      } else {
        this.setState({
          expand: true,
        });
      }
    });
  }

  componentDidMount() {
    this.getValues((value) => {
      this.props.initSearchParams && this.props.initSearchParams(value);
    });
    this.mql = window.matchMedia('(max-width: 768px)');
    this.mql.addListener(this.responsiveHandler);
  }

  componentWillUnmount() {
    this.mql && this.mql.removeListener(this.responsiveHandler);
  }

  getValues(callback) {
    this.props.form.validateFields((err) => {
      if (!err) {
        const res = {};
        const {
          fields,
        } = this.props;
        const values = this.props.values;

        const keys = Object.keys(values || {});
        const findFun = (k) => {
          const key = k;
          return (value) => (value.name || value.dataIndex) === key;
        };
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          const field = fields.find(findFun(key));
          if (field) {
            switch (field.type) {
              case 'dateTimeRange':
                res[`${key}Start`] = values[key] && values[key].length !== 0 && values[key][0].format
                  ? values[key][0].format('YYYY-MM-DD HH:mm:ss') : values[key] && values[key][0];
                res[`${key}End`] = values[key] && values[key].length !== 0 && values[key][1].format
                  ? values[key][1].format('YYYY-MM-DD HH:mm:ss') : values[key] && values[key][1];
                break;
              case 'monthRange':
                res[`${key}Start`] = values[key] && values[key].length !== 0 && values[key][0].format
                  ? values[key][0].format('YYYY-MM-DD') : values[key] && values[key][0];
                res[`${key}End`] = values[key] && values[key].length !== 0 && values[key][1].format
                  ? values[key][1].format('YYYY-MM-DD') : values[key] && values[key][1];
                break;
              case 'date':
                res[key] = values[key] && values[key].format ? values[key].format('YYYY-MM-DD') : values[key];
                break;
              case 'dateTime':
                res[key] = values[key] && values[key].format ? values[key].format('YYYY-MM-DD HH:mm:ss') : values[key];
                break;
              case 'month':
                res[key] = values[key] && values[key].format ? values[key].format('YYYY-MM-01') : values[key];
                break;
              default:
                res[key] = values[key];
            }
          }
        }
        callback(res);
      }
    });
  }

  handleSearch = (searchparams) => {
    this.getValues((values) => {
      const pageSize = (this.props.page && this.props.page.pageSize) || 10;
      this.props.search && this.props.search({
        ...values,
        orderStatus:searchparams,
        pageNo: 1,
        pageSize,
      });
    });
  };
  tabHandleSearch = (searchparams) => {
    this.getValues((values) => {
      const pageSize = (this.props.page && this.props.page.pageSize) || 10;
      this.props.changeOrderStatus({ orderStatus:searchparams });
      this.props.search && this.props.search({
        ...values,
        orderStatus:searchparams,
        pageNo: 1,
        pageSize,
      });
    });
  };

  handleReset = () => {
    if (this.props.reset) {
      this.props.reset();
    } else {
      this.props.form.resetFields();
    }
  };

  render() {
    let {
      fields,
      orderStatusActive,
    } = this.props;

    const {
      expand,
    } = this.state;

    // To generate mock Form.Item
    fields = fields.filter((item) => !item.searchShowHidden);
    const children = [];
    const len = fields.length;
    const labelCol = expand ? 7 : 4;
    const wrapperCol = expand ? 17 : 20;
    for (let i = 0; i < len; i += 1) {
      children.push(
        createFormItem({
          field: fields[i],
          form: this.props.form,
          formItemLayout: {
            labelCol: { span: fields[i].large ? 2 : labelCol },
            wrapperCol: { span: fields[i].large ? 22 : wrapperCol },
          },
          inputOpts: {
          },
          colSpan: !expand || fields[i].large ? 24 : 8,
        })
      );
    }

    if (!orderStatusActive) {
      orderStatusActive = [true, false, false, false, false, false];
    }
    return (
      <Form
        className="ant-advanced-search-form"
        style={{ position:'relative', marginBottom:'45px' }}
      >
        <Row gutter={20}>
          {children}
        </Row>
        <Row gutter={20}>
          <Col span={8} style={{ textAlign: 'left' }}>
            <FormItem wrapperCol={{ span: 17, offset: 7 }}>
              <Button type="primary" onClick={this.tabHandleSearch.bind(this, 0)} style={{ width: 195 }}>搜索</Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20} className="order-tabs" >
          <Button
            className={orderStatusActive[0] ? 'active' : ''}
            onClick={this.tabHandleSearch.bind(this, 0)}
          >全部</Button>
          <Button
            className={orderStatusActive[2] ? 'active' : ''}
            onClick={this.tabHandleSearch.bind(this, 2)}
          >待发货</Button>
          <Button
            className={orderStatusActive[3] ? 'active' : ''}
            onClick={this.tabHandleSearch.bind(this, 3)}
          >待签收</Button>
          <Button
            className={orderStatusActive[4] ? 'active' : ''}
            onClick={this.tabHandleSearch.bind(this, 4)}
          >已完成</Button>
          <Button
            className={orderStatusActive[5] ? 'active' : ''}
            onClick={this.tabHandleSearch.bind(this, 5)}
          >已关闭</Button>
        </Row>
      </Form>
    );
  }
}

const NewWrappedAdvancedSearchForm = Form.create({
  mapPropsToFields,
  onFieldsChange,
})(NewAdvancedSearchForm);

export default NewWrappedAdvancedSearchForm;
