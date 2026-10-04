# Kullanıcının verdiği Türkçe anlamları kartlara (meanings alanı) işler.
import json
p='data/conjunctions.json'
cards=json.load(open(p,encoding='utf-8'))
M={
'cause-clause':{'Because':'İçin, -den dolayı, çünkü, -dığı için','Since':'İçin, nedenden ötürü, -dığı için, çünkü, sebebiyle, olduğu için','As':'İçin, nedenden ötürü, çünkü, -dığı için, -dıkça'},
'result-adv':{'Therefore':'Bu nedenle, bundan dolayı, bu yüzden, dolayısıyla','As a result':'Sonuç olarak'},
'result-so':{'So':'Böylece, bu yüzden, dolayısıyla'},
'as-a-result-of':{'As a result of':'Bir sonucu olarak'},
'cause-noun':{'Due to':'-den dolayı, yüzünden, sebebiyle (kaynaklanan durum)','Because of':'Yüzünden, sayesinde, sebebiyle','On account of':'Yüzünden, -den dolayı, sayesinde'},
'by-means-of':{'By means of':'Aracılığıyla, vasıtasıyla'},
'concession-clause':{'Although':'Rağmen, olmasına rağmen','Even though':'Rağmen, -sa bile, -e rağmen, zıtlık bildiren "de"','Though':'İse, buna karşın'},
'contrast-clause':{'Whereas':'Oysa, rağmen','While':'Zıtlıkta: rağmen, oysa, olmasına rağmen; zamanda: -iken, eşzamanlı olarak'},
'but':{'But':'Fakat, ancak, ama, olsa da, de'},
'adv-contrast':{'However':'Ancak, yine de'},
'even-if':{'Even if':'Olsa da, bile, olsa bile'},
'concession-noun':{'Despite':'Rağmen'},
'unlike':{'In contrast to':'Aksine','As opposed to':'Zıt olarak, aksine'},
'regardless-of':{'Regardless of':'Bakılmaksızın, onlardan bağımsız olarak'},
'not-only':{'Not only ... but also':'Sadece ... değil, aynı zamanda'},
'either-neither':{'Either ... or':'Cümlede zaten olumsuz bir özne (no one gibi) varsa "ne ... ne de" anlamı verir','Neither ... nor':'Ne ... ne de'},
'both-and':{'Both ... and':'Hem ... hem de (olumlu durumları bağlar)'},
'whether':{'Whether ... or (not)':'Olup olmadığı, yoksa ... mi, mi ... yoksa'},
'as-as':{'as + adj / adv + as':'Kadar çok, eşitlik','as much / many ... as':'Kadar (eşitlik veya kıyaslama)'},
'so-that-degree':{'so + adj / adv + that':'O kadar ... ki, öylesine ... ki'},
'such-that':{'such (a / an) + (adj) + noun + that':'O kadar ... ki, öylesine ... ki'},
'just-as':{'Just as ... so':'Tıpkı ... gibi (denklik, benzerlik)'},
'as-if':{'As if':'Gibi, sanki ... gibi','As though':'Gibi, sanki ... gibi'},
'purpose-clause':{'So that':'İçin, amacıyla, -sın diye'},
'purpose-inf':{'In order to':'Amacıyla, için'},
'if-basic':{'If':'-ersek, edersek, eğer (koşul-sonuç)'},
'unless':{'Unless':'Olmadıkça, -medikçe, -mezse (olumsuz koşul)'},
'condition-strict':{'Only if':'Sadece ... ise'},
'in-case':{'In case of (+ isim)':'Durumunda'},
'time-while':{'When':'-de, -dığında','While':'-iken, eşzamanlı olarak'},
'time-before':{'Before':'-den önce'},
'time-until':{'Until':'-e kadar'},
'time-during':{'Throughout':'Boyunca'},
'time-upon':{'Upon arrival':'Varır varmaz'},
'in-terms-of':{'In terms of':'Açısından, bakımından, bağlamında'},
'addition-noun':{'In addition to':'Ek olarak, ilaveten','Apart from':'Yanı sıra, dışında','As well as':'Yanı sıra'},
'along-with':{'Along with':'Birlikte, yanı sıra'},
'instead-adv':{'Instead':'Bunun yerine'},
'instead-of':{'Instead of':'Yerine (bir seçeneği diğerine tercih)'},
'for-example':{'Such as':'Gibi (örneklendirme)'},
'according-to':{'According to':'Göre, uygun olarak'},
'by-ving':{'By + V-ing':'Ederek, sayesinde, yoluyla'},
}
ids={c['id'] for c in cards}
assert set(M)<=ids, set(M)-ids
for c in cards:
    if c['id'] in M:
        for k in M[c['id']]: assert k in c['group'], (c['id'],k)
        c['meanings']=M[c['id']]
json.dump(cards,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(sum('meanings' in c for c in cards),'kartta anlam listesi var')
