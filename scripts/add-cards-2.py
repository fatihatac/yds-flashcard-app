# Kullanıcının verdiği bağlaç listesine göre eksik kartları ekler (tek seferlik).
import json
p='data/conjunctions.json'
cards=json.load(open(p,encoding='utf-8'))
by={c['id']:c for c in cards}
def card(id,cat,tr,rule,group,meaning,usage,en,trs,tip):
    return dict(id=id,category=cat,tr=tr,rule=rule,group=group,meaning=meaning,usage=usage,example=dict(en=en,tr=trs),tip=tip)
new=[
card('result-so','Sonuç','bu yüzden, böylece','Cümle ortasında virgülden sonra gelir; arkasından tam cümle alır',['So','and so'],
 'Önceki cümlenin doğrudan sonucunu bildirir.','So bir bağlaçtır; iki cümleyi virgülle birleştirir. Therefore / Thus ise cümleler arası zarftır.',
 'The pipeline burst during the night, so the entire district was left without water.','Boru gece patladı, bu yüzden bütün mahalle susuz kaldı.',
 'So (sonuç) ile so that (amaç) karıştırma: so that + can / would; so + düz sonuç cümlesi. Bağlaç olduğu için önünde virgül bulunur.'),
card('as-a-result-of','Sonuç','-in sonucunda, -in bir sonucu olarak','Arkasından isim / V-ing alır',['As a result of','As a consequence of','In consequence of'],
 'Bir olayın sonucunda ortaya çıkan durumu isim grubuyla belirtir.','Because of / due to ile aynı yapıdadır, ancak nedenden çok sonucu vurgular.',
 'As a result of the merger, more than 2,000 employees lost their jobs.','Birleşmenin sonucunda 2.000\'den fazla çalışan işini kaybetti.',
 '"As a result" (of yok) cümleler arasındadır: As a result, ... "As a result of" ise isim alır. Boşluktan sonra isim varsa of\'lu olanı seç.'),
card('by-means-of','Sebep','-aracılığıyla, vasıtasıyla','Arkasından isim alır',['By means of','Through','By way of','Via'],
 'Bir işin hangi araç veya yöntemle yapıldığını belirtir.','By means of + isim grubu. Yöntem eylem olarak verilecekse by + V-ing kullanılır.',
 'The data were collected by means of structured interviews.','Veriler yapılandırılmış görüşmeler aracılığıyla toplandı.',
 'By means of sonrasında fiilli cümle gelmez. Eylemle yöntem anlatıyorsan by + V-ing tercih et.'),
card('but','Zıtlık','fakat, ama','Cümle ortasında virgülden sonra gelir; arkasından tam cümle alır',['But','Yet'],
 'İki zıt fikri veya beklenmedik durumu bağlar.','But / Yet eş değerli (coordinating) bağlaçlardır; önlerinde virgül kullanılır. Yet daha vurguludur.',
 'The proposal was innovative, but it was too expensive to implement.','Teklif yenilikçiydi, ancak uygulanması çok pahalıydı.',
 'Although / Even though ile but aynı cümlede kullanılmaz. But virgülle bağlanır; however ise cümleler arasındadır (önünde nokta / noktalı virgül).'),
card('regardless-of','Zıtlık','-e bakılmaksızın, -den bağımsız olarak','Arkasından isim / V-ing / whether alır',['Regardless of','Irrespective of','Regardless of whether'],
 'Bir etkenin sonucu değiştirmediğini belirtir.','Regardless of + isim / V-ing / wh- sözcüğü. Regardless tek başına "yine de" anlamlı zarf olabilir.',
 'Admission is based on merit, regardless of an applicant\'s background.','Kabul, adayın geçmişine bakılmaksızın liyakate göre yapılır.',
 'Regardless of + isim / V-ing / whether. Fiilli düz cümle gelmez; "regardless of the fact that" = despite the fact that.'),
card('as-as','Karşılaştırma','kadar (eşitlik)','as + sıfat / zarf + as',['as + adj / adv + as','as much / many ... as','not as / so ... as'],
 'İki şeyin aynı derecede olduğunu veya (olumsuzda) birinin diğerinden az olduğunu belirtir.','Sayılabilir isimle as many ... as, sayılamayan isimle as much ... as kullanılır.',
 'The new model is as reliable as the older one, but considerably cheaper.','Yeni model eskisi kadar güvenilir, ancak belirgin biçimde daha ucuz.',
 'İki as arasında sıfat / zarf kalır; as ... than yanlıştır (than yalnızca üstünlükte). Olumsuzda not as ... as = daha az.'),
card('just-as','Karşılaştırma','tıpkı ... gibi, ... nasıl ... öyle','Just as + cümle, so + cümle (so\'dan sonra devrik yapı olabilir)',['Just as ... so','In the same way that','Like'],
 'İki durumun benzerliğini veya denkliğini vurgular.','Just as ile başlayan yan cümle karşılaştırılan durumu verir, so ise ana cümleyi başlatır.',
 'Just as technology has transformed communication, so has it reshaped education.','Teknoloji iletişimi nasıl dönüştürdüyse eğitimi de öyle yeniden şekillendirdi.',
 'So\'dan sonra devrik yapı gelebilir (so has it). Like + isim; as / just as + cümle farkını bil: Like his father / As his father did.'),
card('if-basic','Koşul','eğer, -ise','Arkasından tam cümle alır',['If','Supposing (that)','Assuming (that)','In the event that'],
 'Bir koşulun gerçekleşmesi halinde sonucu bildirir.','Tip 0: If + present, present. Tip 1: If + present, will V1. Tip 2: If + past, would V1. Tip 3: If + had V3, would have V3. If cümlesinde will / would kullanılmaz.',
 'If the government raises interest rates, borrowing will become more expensive.','Hükümet faiz oranlarını artırırsa borçlanma daha pahalı hale gelecektir.',
 'If cümlesine bakarak ana cümleyi eşleştir: present → will V1; past → would V1; had V3 → would have V3. If cümlesinde will / would olmaz.'),
card('time-upon','Zaman','-ir -mez, -diği anda','Arkasından isim / V-ing alır',['Upon / On + V-ing','Upon arrival','On + isim'],
 'Bir eylemin hemen ardından başka bir eylemin geldiğini gösterir.','Upon / On + V-ing = As soon as + cümle. Upon arrival, upon request gibi kalıplarda isimle de gelir.',
 'Upon arriving at the airport, the delegation was welcomed by the minister.','Havalimanına varır varmaz heyet bakan tarafından karşılandı.',
 'Upon / On + V-ing yapısının öznesi ana cümlenin öznesiyle aynı olmalıdır. As soon as ise kendi öznesini alır.'),
card('in-terms-of','Diğer','açısından, bakımından','Arkasından isim / V-ing alır',['In terms of','With respect to','From the viewpoint of','As far as ... is concerned'],
 'Bir konuyu hangi yönden değerlendirdiğini belirtir.','In terms of + isim / V-ing. As far as + isim + is concerned aynı anlamdadır; yapısı farklıdır.',
 'In terms of cost, the second option is clearly preferable.','Maliyet açısından ikinci seçenek açıkça tercih edilebilir.',
 'In terms of sonrası isim grubu gelir. As far as ... is concerned yapısında isim araya girer: As far as cost is concerned, ...'),
card('along-with','Ekleme','ile birlikte, -in yanı sıra','Arkasından isim alır',['Along with','Together with','Accompanied by'],
 'Ana özneye eşlik eden başka bir kişi veya şeyi belirtir.','Bu ifadeler özneye eklenir ama özneyi çoğul yapmaz.',
 'The director, along with his deputies, was invited to the ceremony.','Müdür, yardımcılarıyla birlikte törene davet edildi.',
 'Along with / together with / as well as araya girdiğinde fiil ilk özneye uyar (The director ... was). And ile bağlansaydı fiil çoğul olurdu.'),
card('by-ving','Diğer','-erek, -mesiyle, yoluyla','By + V-ing',['By + V-ing','By means of + isim','Through + V-ing'],
 'Bir sonucun hangi eylemle elde edildiğini belirtir.','By + V-ing nasıl sorusunu, in order to + V1 niçin sorusunu yanıtlar.',
 'The firm reduced its costs by outsourcing part of its production.','Firma üretiminin bir kısmını dışarıya vererek maliyetlerini düşürdü.',
 'By sonrasında V-ing gelir (V1 yanlıştır). Yöntem → by cutting costs; amaç → in order to cut costs.'),
card('instead-adv','Karşılaştırma','bunun yerine','İki cümle arasında kullanılan zarf',['Instead','Alternatively','Rather'],
 'Önceki cümlede reddedilen şeyin yerine geçen seçeneği bildirir.','Instead tek başına cümle başında / sonunda gelir. Sonrasında isim veya V-ing varsa instead of kullanılır.',
 'The council rejected the plan to widen the road. Instead, it proposed building a new tram line.','Meclis yolu genişletme planını reddetti. Bunun yerine yeni bir tramvay hattı yapılmasını önerdi.',
 'Instead (of\'suz) cümleler arasındadır; isim / V-ing gelecekse instead of. Rather tek başına bu anlamda resmi dilde nadirdir; rather than ayrıdır.'),
]
# mevcut kartlarda düzenlemeler
g=by['unlike']['group']; g.insert(2,'As opposed to')
by['unlike']['tr']='-in aksine, -e karşıt olarak'
by['unlike']['meaning']+=' As opposed to + isim / V-ing de aynı biçimde karşıtlık kurar.'
by['whatever-however']['group']=[x for x in by['whatever-however']['group'] if x!='Regardless of']
by['time-after']['group']=[x for x in by['time-after']['group'] if x not in ('Upon','On')]
by['either-neither']['usage']+=' Cümlede zaten olumsuz bir ifade varsa (not, no one, never) either ... or ile "ne ... ne de" anlamı elde edilir: She cannot speak either French or German.'
cards.extend(new)
json.dump(cards,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(len(cards))
