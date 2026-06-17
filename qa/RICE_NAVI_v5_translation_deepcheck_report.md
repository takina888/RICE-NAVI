# RICE NAVI v5 translation deep-check report

## Summary
- Cards checked: 82
- zh_cn critical text fixes applied: 93 field-level changes
- Missing translated fields: 0
- English fields containing CJK: 0
- Chinese fields containing Japanese kana: 0
- Remaining critical zh_cn traditional remnants: 0
- undefined strings: 0

## Main fixes
- zh_cn: 為什麼/什麼 → 为什么/什么
- zh_cn: 工廠 → 工厂, 殘 → 残, 時機 → 时机, 違 → 违
- zh_cn: 米饭加工 → 米饭蒸煮 / 蒸煮後 context-normalized
- Fixed unnatural strings such as 「同水量以也蒸发量違…」 and 「水分值，并；…」

## Remaining warnings
- Some English / Chinese explanations are still intentionally repeated by card family. This is not a missing-translation error, but it should be polished later for reading quality.
- Water/storage and Future Rice modules remain partially Japanese-centered, as noted in v4.

## Repeated phrase candidates
- en / short repeated 12 times: This card explains why soaking conditions affect water absorption before heating.
- en / short repeated 10 times: This card treats soaking temperature as a condition that can change absorption and texture.
- en / short repeated 9 times: This card explains why high-temperature holding time matters after boiling is reached.
- en / short repeated 17 times: This card explains water balance through added water, absorbed water, adhering water, and evaporation.
- en / short repeated 13 times: This card separates texture into hardness, stickiness, adhesiveness, grain feel, and unevenness.
- en / easy repeated 12 times: Soaking is an active pre-cooking step. Record both soaking time and water temperature, because time alone does not describe the rice-grain condition.
- en / easy repeated 10 times: Do not treat warm or high-temperature soaking as a simple shortcut. Check water temperature, soaking time, surface condition, and the cooked texture together.
- en / easy repeated 9 times: Do not judge the process only by the highest temperature. Check time to boiling, holding time at high temperature, and texture at the center of the grain.
- en / easy repeated 17 times: When adjusting water, separate rice weight, washed-rice weight, added water, evaporation loss, and cooked weight instead of judging by one number.
- en / easy repeated 13 times: Avoid one-word judgments such as 'hard' or 'sticky'. Record the actual texture words and connect them to soaking, water balance, heating, and resting.
- en / numbers_conditions repeated 19 times: Values must be interpreted within each cited literature condition.
- en / warning repeated 52 times: Do not confuse literature conditions with site conditions.
- en / warning repeated 28 times: Do not use this as a site setting value without checking the research conditions, variety, and equipment conditions.
- zh_tw / short repeated 12 times: 這張卡說明浸泡條件如何影響加熱前的吸水。
- zh_tw / short repeated 10 times: 這張卡把浸泡溫度視為會改變吸水與口感的條件。
- zh_tw / short repeated 9 times: 這張卡說明到達沸騰後，高溫保持時間為什麼重要。
- zh_tw / short repeated 17 times: 這張卡用加水、吸水、附著水與蒸發來看水分平衡。
- zh_tw / short repeated 13 times: 這張卡把口感拆成硬度、黏性、附著性、粒感與不均一感。
- zh_tw / easy repeated 12 times: 浸泡不是單純等待，而是炊飯前的重要工程。時間之外，也要記錄水溫，才能理解米粒狀態。
- zh_tw / easy repeated 10 times: 不要把溫水或高溫浸泡只當作縮短時間的方法。要同時確認水溫、浸泡時間、表層狀態與炊飯後口感。

## Change log sample
- RW_CORE_003 field_check_points: 确认／记录：是否有夹生；浸泡时间；水温；升温速度；米饭加工后中心部硬度。 -> 确认／记录：是否有夹生；浸泡时间；水温；升温速度；蒸煮后中心部硬度。
- RW_CORE_004 easy: 不要把温水或高温浸泡只当作缩短时间的方法。要同时确认水温、浸泡时间、表层状态与米饭加工后口感。 -> 不要把温水或高温浸泡只当作缩短时间的方法。要同时确认水温、浸泡时间、表层状态与蒸煮后口感。
- RW_CORE_004 field_check_points: 确认／记录：高温浸泡温度实测；时间；米饭加工后黏性、粒感与粉感。 -> 确认／记录：高温浸泡温度实测；时间；蒸煮后黏性、粒感与粉感。
- RW_CORE_005 short: 这张卡说明：不要只用水分量判断米饭加工是否完成。 -> 这张卡说明：不要只用水分量判断米饭是否煮熟。
- RW_CORE_005 field_check_points: 确认／记录：水分；硬度；中心部；米饭加工时间；是否有焖蒸。 -> 确认／记录：水分；硬度；中心部；蒸煮时间；是否有焖蒸。
- RW_CORE_005 related_terms: 米饭加工 -> 米饭蒸煮
- RW_CORE_006 short: 这张卡说明到达沸腾后，高温保持时间为什麼重要。 -> 这张卡说明到达沸腾后，高温保持时间为什么重要。
- RW_CORE_007 easy: 焖蒸不是单纯放置。它能让殘留游离水进入饭粒，并在松饭或排出前减少水分不均。 -> 焖蒸不是单纯放置。它能让残留游离水进入饭粒，并在松饭或排出前减少水分不均。
- RW_CORE_007 field_check_points: 确认／记录：焖蒸时间；排出时機；松饭前后水分不均。 -> 确认／记录：焖蒸时间；排出时机；松饭前后水分不均。
- RW_CORE_008 short: 这张卡把米饭加工后温度与变硬、食味变化连起来。 -> 这张卡把蒸煮后温度与变硬、食味变化连起来。
- RW_CORE_009 short: 这张卡把米饭加工后温度与变硬、食味变化连起来。 -> 这张卡把蒸煮后温度与变硬、食味变化连起来。
- RW_CORE_010 related_terms: 米饭加工工序 -> 米饭蒸煮工序
- RW_CORE_011 easy: 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与米饭加工后重量，不要只看单一数字。 -> 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与蒸煮后重量，不要只看单一数字。
- RW_CORE_011 field_check_points: 确认／记录：米重量；洗米后重量；蒸发量；米饭加工后重量。 -> 确认／记录：米重量；洗米后重量；蒸发量；蒸煮后重量。
- RW_CORE_012 short: 这张卡说明：米饭加工后重量倍率可作为结果指标。 -> 这张卡说明：蒸煮后重量倍率可作为结果指标。
- RW_CORE_012 numbers_conditions: 一般说明值：米饭加工后重量约2.1～2.3倍，会因用途与偏好而变動。 -> 一般说明值：蒸煮后重量约2.1～2.3倍，会因用途与偏好而变動。
- RW_CORE_012 field_check_points: 确认／记录：同水量以也蒸发量違与米饭加工结果倍率改变。 -> 确认／记录：同水量以也蒸发量违与蒸煮结果倍率改变。
- RW_CORE_012 related_terms: 米饭加工工序 -> 米饭蒸煮工序
- RW_CORE_013 easy: 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与米饭加工后重量，不要只看单一数字。 -> 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与蒸煮后重量，不要只看单一数字。
- RW_CORE_015 easy: 不要把温水或高温浸泡只当作缩短时间的方法。要同时确认水温、浸泡时间、表层状态与米饭加工后口感。 -> 不要把温水或高温浸泡只当作缩短时间的方法。要同时确认水温、浸泡时间、表层状态与蒸煮后口感。
- RW_CORE_015 field_check_points: 确认／记录：温水利用时时间／温度／再米饭加工后物性。 -> 确认／记录：温水利用时时间／温度／再蒸煮后物性。
- RW_CORE_016 short: 这张卡说明到达沸腾后，高温保持时间为什麼重要。 -> 这张卡说明到达沸腾后，高温保持时间为什么重要。
- RW_CORE_016 numbers_conditions: 糙米驚煮法条件；不可直接套用于白饭或工廠米饭加工。 -> 糙米二次加水蒸煮法研究条件；不可直接套用于白米饭或工厂蒸煮。
- RW_CORE_016 field_check_points: 确认／记录：沸腾到达时刻以；到达后的保持时间。 -> 确认／记录：沸腾到达时刻，以及到达后的保持时间。
- RW_CORE_016 related_terms: 沸腾; 米饭加工 -> 沸腾; 米饭蒸煮
- RW_CORE_017 easy: 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与米饭加工后重量，不要只看单一数字。 -> 调整加水时，要分开看米重量、洗米后重量、投入水量、蒸发量与蒸煮后重量，不要只看单一数字。
- RW_CORE_017 numbers_conditions: 糙米驚煮法条件；不可直接套用于白饭或工廠米饭加工。 -> 糙米二次加水蒸煮法研究条件；不可直接套用于白米饭或工厂蒸煮。
- RW_CORE_017 field_check_points: 确认／记录：加水量；加水时機；再沸腾时间；保持时间。 -> 确认／记录：加水量；加水时机；再沸腾时间；保持时间。
- RW_CORE_017 related_terms: 米饭加工工序 -> 米饭蒸煮工序
- RW_CORE_018 field_check_points: 确认／记录：水分值，并；硬度／黏性／附着性／外观合看。 -> 确认／记录：水分值、硬度、黏性、附着性与外观。