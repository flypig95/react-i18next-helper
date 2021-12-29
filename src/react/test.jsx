/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import FormRender from 'antd-form-render';
import { obj2Options } from '~/utils/helper';
import {
  Form,
  Button,
  Space,
  Input,
  Radio,
  Select,
  Steps,
  Card,
  InputNumber,
  Popconfirm,
  message,
} from 'antd';
import { useParams } from 'react-router-dom';
import UploadManage from '../UploadManage';
import * as service from '~/service';
import './AddTask.less';
const { Step } = Steps;

export default function AddCompTask({ history }) {
  const [data, setData] = useState({
    fee: 0,
  });
  const [files, setFiles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [spInfo, setSpInfo] = useState({}); // 服务商信息
  const [companies, setCompanies] = useState([]);
  // baseform
  const [form] = Form.useForm();

  const { id } = useParams();

  useEffect(() => {
    form.resetFields();
    Promise.all([
      service.getTaskIndustries(),
      service.getServiceProviderInfo(),
      service.getCustomerCompany(),
    ])
      .then(([_indestries, _spInfo, _company]) => {
        setIndustries(obj2Options(_indestries));
        setSpInfo(_spInfo || {});

        _company = _company.map((item) => ({
          label: item.name,
          value: item.custId,
        }));
        setCompanies(_company);
        form.setFieldsValue({
          custId: _company[0].value,
        });
      })
      .catch(() => {});

    if (id) {
      service
        .getTaskDetail(id)
        .then((res) => {
          res.industry = res.industry.map((v) => v.toString());
          res.custId = res.custId?.toString();
          setData(res);
          form.setFieldsValue(res);
          setFiles(res.contracts);
        })
        .catch(() => {});
    }
  }, []);

  const serviceFee = (spInfo.rate / 100) * data.fee;
  const total = serviceFee + data.fee;

  // base layout
  const layout = [
    {
      type: Select,
      label: t('customer-enterprise'),
      placeholder: t('please-select'),
      name: 'custId',
      elProps: {
        options: companies,
        disabled: companies.length === 1,
      },
      itemProps: {
        rules: [{ required: true, message: t('please-select') }],
      },
    },
    {
      type: Select,
      label: t('task-list-industry'),
      placeholder: t('please-select'),
      name: 'industry',
      elProps: {
        options: industries,
        mode: 'multiple',
      },
      itemProps: {
        rules: [{ required: true, message: t('please-select') }],
      },
    },
    {
      type: Input,
      label: t('task-list-name'),
      placeholder: t('please-enter'),
      name: 'name',
      itemProps: {
        rules: [{ required: true, message: t('please-enter') }],
      },
    },
    {
      type: Input.TextArea,
      label: t('task-order-description'),
      placeholder: t('information-such-as-business'),
      name: 'remark',
      elProps: {
        autoSize: {
          minRows: 8,
        },
        showCount: true,
        maxLength: 255,
      },
    },
    {
      type: InputNumber,
      label: t('total-tasks'),
      placeholder: t('please-enter'),
      name: 'fee',
      elProps: {
        precision: 2,
        step: 0.01,
        min: 0,
        style: { width: 200 },
      },
      itemProps: {
        rules: [{ required: true, message: t('please-enter') }],
      },
    },
    {
      render() {
        return (
          <Form.Item label={t('lump-sum-mode-rate')}>
            {spInfo.rate}%<span style={{ marginLeft: 10, color: '#d9d9d9' }}>{t('(minimum-rate-none)')}</span>
          </Form.Item>
        );
      },
    },
    {
      render() {
        return (
          <Form.Item label={t('service-charge')}>
            <Input disabled value={serviceFee} style={{ width: 200 }} />
          </Form.Item>
        );
      },
    },
    {
      render() {
        return (
          <Form.Item label={t('total-amount')}>
            <Input disabled value={total} style={{ width: 200 }} />
          </Form.Item>
        );
      },
    },
    {
      render() {
        return (
          <Form.Item label={t('collection-information')}>
            <div className="skxx">
              <div>{spInfo.bankName}</div>
              <div>{spInfo.bankNum}</div>
              <div>{t('legal-person-information')}{spInfo.legalMan}</div>
            </div>
          </Form.Item>
        );
      },
    },
  ];

  return (
    <div className="form-page add-comp-task">
      {/* <div style={{ margin: '20px auto 50px', width: '50%' }}>
        <Steps current={0} size="small">
          <Step title="第一步" description="任务单信息填写" />
          <Step title="第二步" description="支付" />
        </Steps>
      </div> */}
      <Card title={t('task-list-information')}>
        <Form
          form={form}
          initialValues={data}
          labelCol={{ span: 6 }}
          style={{ width: '50%' }}
          onValuesChange={(changedValues, allValues) => {
            setData(allValues);
          }}
        >
          <FormRender layoutData={layout} />
        </Form>
      </Card>

      <UploadManage files={files} setFiles={setFiles} title={t('business-contract')} style={{ marginTop: 30 }} />

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <Space>
          <Button onClick={() => history.goBack()}>{t('cancel')}</Button>
          <Button
            type="primary"
            ghost
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  const contracts = files?.map((file) => ({
                    link: file.response?.result?.url || file.link,
                    name: file.response?.result?.name || file.name,
                    side: 'FRONT',
                    size: file.response?.result?.size || file.size,
                  }));
                  const params = {
                    ...values,
                    contracts,
                    total,
                    serviceFee,
                  };
                  let fn = null;
                  let msg = '';
                  if (id) {
                    fn = service.updateTask;
                    msg = t('update-succeeded');
                    params.id = id;
                  } else {
                    fn = service.createTask;
                    msg = t('new-successfully');
                  }

                  fn(params).then((res) => {
                    message.success(msg);
                    history.push('/biz/customer-enterprise/task-list');
                  });
                })
                .catch((error) => console.log(error));
            }}
          >{t('confirm')}{id ? t('to-update') : t('newly-build')}
          </Button>
        </Space>
      </div>
    </div>
  );
}
