import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Table, Space, Popover } from 'antd';
import { useAntdTable, useDebounceFn } from 'ahooks';
import FormRenderer, { FormSpaceRender } from 'antd-form-render';
import { Link } from 'react-router-dom';
import * as _ from 'lodash';
import * as service from '~/service';
import usePageTitle from '~/hooks/usePageTitle';

const getTableData = ({ current = 1, pageSize = 10 }, formData = {}) => {
  return service
    .getTaskList({
      pageSize,
      currentPage: current,
      param: { ...formData },
    })
    .then((res) => {
      return {
        total: res.totalItem,
        list: res.resultList || [],
      };
    })
    .catch(() => {});
};

export default function CompTaskList({ history }) {
  usePageTitle(t('task-list-management'));

  const [form] = Form.useForm();
  const { tableProps, search, loading, refresh } = useAntdTable(getTableData, { form });
  const { submit, reset } = search;

  const searchLayout = [
    {
      type: Input,
      label: t('task-list-name'),
      placeholder: t('please-enter-the-task'),
      name: 'name',
      elProps: {
        allowClear: true,
      },
    },
    {
      type: Input,
      label: t('number'),
      placeholder: t('please-enter-the-task'),
      name: 'taskNo',
      elProps: {
        allowClear: true,
      },
    },
    {
      type: Button,
      elProps: {
        type: 'primary',
        htmlType: 'submit',
        children: t('search'),
      },
    },
    {
      type: Button,
      elProps: {
        htmlType: 'reset',
        children: t('reset'),
        onClick: reset,
      },
    },
  ];

  const columns = [
    {
      title: t('number'),
      dataIndex: 'taskNo',
    },
    {
      title: t('task-list-industry'),
      dataIndex: 'industryName',
      render: (text) => text.join('、'),
    },
    {
      title: t('task-list-name'),
      dataIndex: 'name',
    },
    {
      title: t('creator'),
      dataIndex: 'creator',
    },
    {
      title: t('creation-time'),
      dataIndex: 'gmtCreated',
    },
    {
      title: t('total-payment'),
      dataIndex: 'total',
      render: (text) => <b>¥{text.toLocaleString()}</b>,
    },
    // {
    //   title: '支付方式',
    //   dataIndex: 'payType',
    //   render: (text) => text || '--',
    // },
    {
      title: t('state'),
      dataIndex: 'statusName',
      render: (text, record) => {
        return (
          <>
            {text}
            {/* {record.status === '7' && record.extra && (
              <Popover content={<div style={{ width: 200 }}>{record.extra}</div>} trigger="click">
                <a>查看原因</a>
              </Popover>
            )} */}
          </>
        );
      },
    },
    {
      title: t('operation'),
      dataIndex: 'op',
      render: (text, record) => {
        return (
          <Space>
            <Link
              to={`/biz/customer-enterprise/task-detail/${record.id}`}
              style={{ whiteSpace: 'nowrap' }}
            >{t('details')}</Link>
            <Link
              to={`/biz/customer-enterprise/add-task/${record.id}`}
              style={{ whiteSpace: 'nowrap' }}
            >{t('edit')}</Link>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="form-page">
      <div className="list-search">
        <Button type="primary" onClick={() => history.push('/biz/customer-enterprise/add-task')}>{t('new-task-list')}</Button>
        <Form form={form} onFinish={submit}>
          <FormSpaceRender layoutData={searchLayout} />
        </Form>
      </div>
      <div>
        <Table
          className="table-content"
          columns={columns}
          {...tableProps}
          loading={loading}
          rowKey="id"
        />
      </div>
    </div>
  );
}
