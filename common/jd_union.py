# 导入模块
import json
import logging
import time

import requests

from utils import *

logger = logging.getLogger('wx')

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/67.0.3396.87 Safari/537.36"
}

appkey = '1a449d84b554735f7fe3a9037099bddc'
appsecret = '7f69d2fcca5c443386017f9a97d14c83'

order_row_api = 'jd.union.open.order.row.query'
sku_info_api = 'jd.union.open.goods.promotiongoodsinfo.query'


# 查询京东联盟的订单
def get_order():
    # timestamp = '2020-08-12 01:58:02'
    # last_min = datetime.datetime.now() - datetime.timedelta(minutes=1)
    # last_five_min = datetime.datetime.now() - datetime.timedelta(minutes=10)
    last_min = get_last_min_ts()
    last_five_min = get_last_five_min_ts()
    timestamp = last_min.strftime('%Y-%m-%d %H:%M:%S')
    start_time = last_five_min.strftime('%Y-%m-%d %H:%M:00')
    end_time = last_min.strftime('%Y-%m-%d %H:%M:00')

    str_to_sign = appsecret + 'app_key' + appkey + 'formatjsonmethod' + order_row_api + 'param_json{"orderReq":{"startTime":"' + start_time + '","endTime":"' + end_time + '","pageIndex":1,"pageSize":20,"type":1}}sign_methodmd5timestamp' + timestamp + 'v1.0' + appsecret
    sign = md5(str_to_sign)
    # hl = hashlib.md5()
    # hl.update(str_to_sign.encode(encoding='utf-8'))
    # sign = hl.hexdigest().upper()

    url = 'https://router.jd.com/api?v=1.0&method=' + order_row_api + '&access_token=&app_key=' + appkey + '&sign_method=md5&format=json&timestamp=' + timestamp + '&sign=' + sign + '&param_json={"orderReq":{"startTime":"' + start_time + '","endTime":"' + end_time + '","pageIndex":1,"pageSize":20,"type":1}}'

    response = requests.get(url, headers=headers)
    if response.text == '':
        logger.info(order_row_api + " response empty")
        return order_row_api + " response empty"

    json_data = json.loads(response.text)
    result = json_data.get('jd_union_open_order_row_query_response').get('result')
    data = json.loads(result)
    order_list = data.get('data')
    if order_list is None:
        return ''
    else:
        goods_num = 0
        fee_total = 0
        sku_desc = ''
        for order in order_list:
            if order.get('validCode') >= 16:
                estimate_fee = order.get('estimateFee')  # 预计佣金
                if estimate_fee > 0:
                    estimate_cos_price = order.get('estimateCosPrice')  # 订单价格
                    commission_rate = order.get('commissionRate')  # 佣金比例
                    sku_name = order.get('skuName')
                    sku_desc += '\n\n' + sku_name + '\n订单价格：' + str(estimate_cos_price) + '\n佣金比例：' + str(commission_rate) + '\n预计佣金：' + str(estimate_fee)
                    goods_num += 1
                    fee_total += estimate_fee
        if goods_num > 0:
            return '恭喜, 新增佣金 ' + str(fee_total) + ', 新增订单 ' + str(goods_num) + sku_desc
        else:
            return ''


def get_sku_list(sku_ids):
    last_min = get_last_min_ts()
    timestamp = last_min.strftime('%Y-%m-%d %H:%M:%S')

    str_to_sign = appsecret + 'app_key' + appkey + 'formatjsonmethod' + sku_info_api + 'param_json{"skuIds":"' + sku_ids + '"}sign_methodmd5timestamp' + timestamp + 'v1.0' + appsecret
    sign = md5(str_to_sign)

    url = 'https://router.jd.com/api?v=1.0&method=' + sku_info_api + '&access_token=&app_key=' + appkey + '&sign_method=md5&format=json&timestamp=' + timestamp + '&sign=' + sign + '&param_json={"skuIds":"' + sku_ids + '"}'

    response = requests.get(url, headers=headers)
    if response.text == '':
        logger.info(sku_info_api + " response empty")
        return sku_info_api + " response empty"

    json_data = json.loads(response.text)
    result = json_data.get('jd_union_open_goods_promotiongoodsinfo_query_response').get('result')
    data = json.loads(result)

    time.sleep(1)  # 防止被风控

    return data.get('data')


# 根据 sku 查询商品佣金
def get_sku_info(sku_ids):
    sku_list = get_sku_list(sku_ids)
    if sku_list is None:
        return "没有此 sku 数据"
    else:
        info = '[查询结果]'
        for sku in sku_list:
            goods_name = sku.get('goodsName')
            unit_price = sku.get('unitPrice')
            commision_ratio_pc = sku.get('commisionRatioPc')
            commision = float(unit_price) * float(commision_ratio_pc) / 100
            is_jd_sale = sku.get('isJdSale')
            material_url = sku.get('materialUrl')
            info += "\n\n商品名称：" + goods_name + "\n商品价格：" + str(unit_price) + "\n佣金比例：" + str(
                commision_ratio_pc) + "\n佣金：" + str(commision) + "\n是否自营：" + str(is_jd_sale) + "\n商品地址：" + material_url
        return info


# 根据 sku 查询商品佣金
def get_sku_info_single(sku_id):
    sku_list = get_sku_list(sku_id)
    if sku_list is None or len(sku_list) == 0:
        return None, None, None, None, None, None, None, None, None, None, None, None
    else:
        for sku in sku_list:
            cid = sku.get('cid')
            cid_name = sku.get('cidName')
            cid2 = sku.get('cid2')
            cid2_name = sku.get('cid2Name')
            cid3 = sku.get('cid3')
            cid3_name = sku.get('cid3Name')
            goods_name = sku.get('goodsName')
            unit_price = int(sku.get('unitPrice'))
            commision_ratio_pc = sku.get('commisionRatioPc')
            commision = int(unit_price * float(commision_ratio_pc) / 100)
            is_jd_sale = bool(int(sku.get('isJdSale')))
            in_order_count = sku.get('inOrderCount')
            return goods_name, unit_price, commision_ratio_pc, commision, is_jd_sale, in_order_count, cid, cid_name, cid2, cid2_name, cid3, cid3_name


if __name__ == "__main__":
    # print(get_last_min_ts())
    print(get_order())
    # print(get_order('202008131702'))
    # print(get_sku_info('65379713262,65386799109'))
    # print(get_sku_info_single('67239583445'))
    # goods_name, unit_price, commision_ratio_pc, commision, is_jd_sale, in_order_count, cid, cid_name, cid2, cid2_name, cid3, cid3_name = get_sku_info_single(
    #     '100006686879')
    # print(goods_name)
