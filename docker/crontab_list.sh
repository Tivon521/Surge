# 每3天的23:50分清理一次日志(互助码不清理，proc_file.sh对该文件进行了去重)
50 23 */3 * * find /scripts/logs -name '*.log' | grep -v 'sharecodeCollection' | xargs rm -rf
#收集助力码
30 * * * * sh +x /scripts/docker/auto_help.sh collect >> /scripts/logs/auto_help_collect.log 2>&1

##############短期活动##############
#发财大赢家之翻翻乐 10.26-11.30
10,40 * * * * node /scripts/jd_big_winner.js >> /scripts/logs/jd_big_winner.log 2>&1
#女装盲盒 活动时间：2021-05-24到2021-06-22
35 1,22 * * * node /scripts/jd_nzmh.js >> /scripts/logs/jd_nzmh.log 2>&1

#京东极速版红包(活动时间：2021-5-5至2021-5-31)
45 0,23 * * * node /scripts/jd_speed_redpocke.js >> /scripts/logs/jd_speed_redpocke.log 2>&1
#芥么小程序签到领现金 活动时间：2021-09-16 - 2022-12-31
20 1,12,21 * * * node /scripts/jd_jm_sign.js >> /scripts/logs/jd_jm_sign.log 2>&1
#超级直播间红包雨(活动时间不定期，出现异常提示请忽略。红包雨期间会正常)
1,31 0-23/1 * * * node /scripts/jd_live_redrain.js >> /scripts/logs/jd_live_redrain.log 2>&1

#金榜创造营 活动时间：2021-05-21至2021-12-31
0 1,22 * * * node /scripts/jd_gold_creator.js >> /scripts/logs/jd_gold_creator.log 2>&1
#酷跑零食街(活动时间：2021-06-20到2021-12-31)
18 7,12,20 * * * node /scripts/jd_foodRunning.js >> /scripts/logs/jd_foodRunning.log 2>&1
#内容鉴赏官 2021-09-1到2021-12-31
0 0,22 * * * node /scripts/jd_jsg.js >> /scripts/logs/jd_jsg.log 2>&1
#京喜财富岛——合成珍珠 2021-09-23到2021-9-30
20 * * * * node /scripts/jd_jxbfd_pear_game.js >> /scripts/logs/jd_jxbfd_pear_game.log 2>&1
#京东小家福利社签到（2021年9月10日-2021年12月31日）
5 0,1 * * * node /scripts/jd_flsSign.js >> /scripts/logs/jd_flsSign.log 2>&1
# 伊利养牛
45 2,19 * * * node /scripts/jd_cow.js >> /scripts/logs/jd_cow.log 2>&1
# 蒙牛养牛
35 */1 * * * node /scripts/jd_cow_mengniu.js >> /scripts/logs/jd_cow_mengniu.log 2>&1
# 清风云养树
15 4,15 * * * node /scripts/jd_tree.js >> /scripts/logs/jd_tree.log 2>&1
#红包雨（1.9和1.24日的20点）
1 20,21,22,23 7,9,10,24,25,26 1,2 * node /scripts/jd_hby.js >> /scripts/logs/jd_hby.log 2>&1
#城城分现金
0 0-23/1 * * * node /scripts/jd_city.js >> /scripts/logs/jd_city.log 2>&1
#年货红包🧧
0,10 0,20,23 * * * node /scripts/jd_nianRed.js >> /scripts/logs/jd_nianRed.log 2>&1
##############长期活动##############
# 签到
7 0,17 * * * cd /scripts && node jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
# 京东签到图形验证
5 0,20 * * * node /scripts/jd_sign.js >> /scripts/logs/jd_sign.log 2>&1
# 东东超市兑换奖品
0,30 0 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
# 摇京豆
6 0,23 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
# 东东农场
15 6-18/6 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
# 宠汪汪
45 */2,23 * * * node /scripts/jd_joy.js >> /scripts/logs/jd_joy.log 2>&1
# 宠汪汪积分兑换京豆
0 0-16/8 * * * node /scripts/jd_joy_reward.js >> /scripts/logs/jd_joy_reward.log 2>&1
# 宠汪汪喂食
35 */1 * * * node /scripts/jd_joy_feedPets.js >> /scripts/logs/jd_joy_feedPets.log 2>&1
#宠汪汪偷好友积分与喂食
10 0-21/3 * * * node /scripts/jd_joy_steal.js >> /scripts/logs/jd_joy_steal.log 2>&1
# 摇钱树
23 */2 * * * node /scripts/jd_moneyTree.js >> /scripts/logs/jd_moneyTree.log 2>&1
# 东东萌宠
35 6-18/6 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
# 京东种豆得豆
10 7-22/1 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1
# 京东全民开红包
12 0-23/4 * * * node /scripts/jd_redPacket.js >> /scripts/logs/jd_redPacket.log 2>&1
# 进店领豆
6 0 * * * node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
# 东东超市
31 0,1-23/2 * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
# 取关京东店铺商品
45 23 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
# 京豆变动通知
20 10,20 * * * node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
# 京东抽奖机
0 0,12,23 * * * node /scripts/jd_lotteryMachine.js >> /scripts/logs/jd_lotteryMachine.log 2>&1
# 天天提鹅
28 * * * * node /scripts/jd_daily_egg.js >> /scripts/logs/jd_daily_egg.log 2>&1
# 金融养猪
32 0-23/6 * * * node /scripts/jd_pigPet.js >> /scripts/logs/jd_pigPet.log 2>&1
# 京喜工厂
50 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
# 东东工厂
26 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
# 赚京豆(微信小程序)
12 * * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
# 京东快递签到
47 1 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
# 京东汽车(签到满500赛点可兑换500京豆)
0 0 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
# 领京豆额外奖励(每日可获得3京豆)
23 1,12,22 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
# 微信小程序京东赚赚
6 0-5/1,11 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
# 京东汽车旅程赛点兑换金豆
0 0 * * * node /scripts/jd_car_exchange.js >> /scripts/logs/jd_car_exchange.log 2>&1
# 导到所有互助码
23 7 * * * node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
# 签到领现金
10 */4 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
# 京东秒秒币
10 6,21 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
#美丽研究院
41 7,12,19 * * * node /scripts/jd_beauty.js >> /scripts/logs/jd_beauty.log 2>&1
#京东保价
41 0,23 * * * node /scripts/jd_price.js >> /scripts/logs/jd_price.log 2>&1
#京东极速版签到+赚现金任务
21 1,4,6 * * * node /scripts/jd_speed_sign.js >> /scripts/logs/jd_speed_sign.log 2>&1
#京喜财富岛
5 1,3-8/1,12,13,18,19 * * * node /scripts/jd_jxbfd.js >> /scripts/logs/jd_jxbfd.log 2>&1
#京喜财富岛-收集贝壳，每20分钟一次，可根据自己账号数量进行修改cron
0-59/20 * * * * node /scripts/jd_jxbfd_collect.js >> /scripts/logs/jd_jxbfd_collect.log 2>&1
#财富岛-热气球接待游客和雇佣导游
10 * * * * node /scripts/jd_jxbfd_balloon.js >> /scripts/logs/jd_jxbfd_balloon.log 2>&1
#京东直播（又回来了）
30-50/5 12,23 * * * node /scripts/jd_live.js >> /scripts/logs/jd_live.log 2>&1
#京东健康社区
13 1,6,22 * * * node /scripts/jd_health.js >> /scripts/logs/jd_health.log 2>&1
#京东健康社区收集健康能量
5-45/20 * * * * node /scripts/jd_health_collect.js >> /scripts/logs/jd_health_collect.log 2>&1
#京东健康社区兑换商品
0 0 * * * node /scripts/jd_health_exchange.js >> /scripts/logs/jd_health_exchange.log 2>&1
# 幸运大转盘
10 10,23 * * * node /scripts/jd_market_lottery.js >> /scripts/logs/jd_market_lottery.log 2>&1
# 领金贴
5 0 * * * node /scripts/jd_jin_tie.js >> /scripts/logs/jd_jin_tie.log 2>&1
# 跳跳乐瓜分京豆
15 0,12,22 * * * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1
#京喜牧场
25 * * * * node /scripts/jd_jxmc.js >> /scripts/logs/jd_jxmc.log 2>&1
#电竞经理
30 3,12,22 * * * node /scripts/jd_esManager.js >> /scripts/logs/jd_esManager.log 2>&1
#送豆得豆
24 0 * * * node /scripts/jd_sendBeans.js >> /scripts/logs/jd_sendBeans.log 2>&1
#获取京东系列脚本的cookie
0 0-23/4 * * * node /scripts/jd_jddj_getCk.js >> /scripts/logs/jd_jddj_getCk.log 2>&1
#京东到家鲜豆任务
30 10 * * * node /scripts/jd_jddj_dailyTask.js >> /scripts/logs/jd_jddj_dailyTask.log 2>&1
#京东到家农场
30 8,11,17 * * * node /scripts/jd_jddj_fruit.js >> /scripts/logs/jd_jddj_fruit.log 2>&1
#京东到家农场收集水车水滴
30 * * * * node /scripts/jd_jddj_fruit_collect.js >> /scripts/logs/jd_jddj_fruit_collect.log 2>&1
#京东到家鲜豆庄园
30 7,10,16 * * * node /scripts/jd_jddj_plantBeans.js >> /scripts/logs/jd_jddj_plantBeans.log 2>&1
#京东到家鲜豆庄园收水车水滴
30 * * * * node /scripts/jd_jddj_plantBeans_collect.js >> /scripts/logs/jd_jddj_plantBeans_collect.log 2>&1
#汪汪乐园（京东极速版APP）
44 3,22 * * * node /scripts/jd_joy_park.js >> /scripts/logs/jd_joy_park.log 2>&1
#汪汪乐园合并汪汪
14 0-23/3 * * * node /scripts/jd_joy_park_merge.js >> /scripts/logs/jd_joy_park_merge.log 2>&1
#领京豆
50 4 * * * node /scripts/jd_ljd.js >> /scripts/logs/jd_ljd.log 2>&1
#特务Z，做任务抽奖，不定期出现活动
50 19,22 * * * node /scripts/jd_productBrand.js >> /scripts/logs/jd_productBrand.log 2>&1
#自动获取宠旺旺的invokeKey
5 0-23/6 * * * node /scripts/jd_get_invokeKey.js >> /scripts/logs/jd_get_invokeKey.log 2>&1
#京喜签到
15 0,12,21 * * * node /scripts/jd_jxsign.js >> /scripts/logs/jd_jxsign.log 2>&1
#京东店铺会员卡（提供手动注销店铺会员卡链接，脚本不能自动注销）
55 20 * * 6 node /scripts/jd_unbind.js >> /scripts/logs/jd_unbind.log 2>&1
# 京喜购物返红包
20 0-23/6 * * * node /scripts/jd_jxrebate.js >> /scripts/logs/jd_jxrebate.log 2>&1
# 东东世界
3 0 * * * node /scripts/jd_ddworld.js >> /scripts/logs/jd_ddworld.log 2>&1
# 美丽研究院，种植园
5 5,14 * * * node /scripts/jd_beauty_plantation.js >> /scripts/logs/jd_beauty_plantation.log 2>&1
# 清空购物车
15 9 * * 5 node /scripts/jd_clear_cart.js >> /scripts/logs/jd_clear_cart.log 2>&1
# 逛好物，赚京豆
1 0,12,18,22 * * * node /scripts/jd_ifanli.js >> /scripts/logs/jd_ifanli.log 2>&1
#发财挖宝
20 6,12,16,22 * * * node /scripts/jd_fcwb.js >> /scripts/logs/jd_fcwb.log 2>&1
# 连续签到，赢大额京豆
1 1,21 * * * node /scripts/jd_sendBeans_sign.js >> /scripts/logs/jd_sendBeans_sign.log 2>&1
# 京东半年红包明细
1 10 1,20 * * node /scripts/jd_halfYearRed.js >> /scripts/logs/jd_halfYearRed.log 2>&1
# 集勋章、赢好礼
14 7,21 * * * node /scripts/jd_fruit_medal.js >> /scripts/logs/jd_fruit_medal.log 2>&1
# 京豆兑换喜豆
1 23 * * * node /scripts/jd_jd2xd.js >> /scripts/logs/jd_jd2xd.log 2>&1
# 京东购物车商品转链
0 6,18 * * * node /scripts/jd_jingfen.js >> /scripts/logs/jd_jingfen.log 2>&1
# 京喜签到-喜豆
10 2,9,21 * * * node /scripts/jd_jxsign_xd.js >> /scripts/logs/jd_jxsign_xd.log 2>&1
# 首页特务
23 11,14,20 * * * node /scripts/jd_productZ4Brand.js >> /scripts/logs/jd_productZ4Brand.log 2>&1