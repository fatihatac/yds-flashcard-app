# Gramer soruları: (konu id, soru, şıklar, doğru şık indeksi, öğretici açıklama)
Q = [
# Present Simple / Continuous
("g-present-simple-continuous","Water ____ at 100 degrees Celsius at sea level.",["is boiling","boils","has boiled","boiled","will boil"],1,"Genel doğru (bilimsel gerçek) Present Simple ile verilir: boils."),
("g-present-simple-continuous","Scientists ____ a new vaccine at the moment, and they expect results next year.",["develop","are developing","developed","have developed","develops"],1,"'At the moment' süren eylemi gösterir: Present Continuous (are developing)."),
("g-present-simple-continuous","I ____ that this solution is the best one available.",["am believing","believe","have been believing","will believe","was believing"],1,"Believe bir durum (stative) fiilidir; sürekli yapıda kullanılmaz: believe."),
# Past vs perfect
("g-past-vs-perfect","The company ____ its profits twice since it moved to the new market.",["doubled","has doubled","had doubled","doubles","was doubling"],1,"Since + geçmiş zaman → ana cümlede Present Perfect: has doubled."),
("g-past-vs-perfect","The treaty ____ in 1998 after months of negotiation.",["has been signed","was signed","has signed","is signed","had signed"],1,"'In 1998' belirli geçmiş zaman ifadesi; Present Perfect kullanılamaz. Özne antlaşma olduğu için pasif: was signed."),
("g-past-vs-perfect","It is the first time that she ____ a presentation in English.",["gives","gave","has given","had given","is giving"],2,"'It is the first time' kalıbından sonra Present Perfect gelir: has given."),
# Present perfect continuous
("g-present-perfect-continuous","Prices ____ steadily since the beginning of the year.",["rose","have been rising","are rising","had risen","rise"],1,"Since ile sürekli bir değişim vurgulanıyor: have been rising."),
("g-present-perfect-continuous","How long ____ for this company?",["do you work","did you work","have you been working","are you working","will you work"],2,"'How long' süre sorusudur; süregelen eylem için Present Perfect Continuous kullanılır."),
("g-present-perfect-continuous","I ____ this man for ten years, and I have never seen him lose his temper.",["have been knowing","have known","know","knew","had been knowing"],1,"Know durum fiilidir; -ing'li perfect yapısı kullanılmaz: have known."),
# Past perfect
("g-past-perfect","By the time the rescue team arrived, the climbers ____ trapped for two days.",["were","have been","had been","are","would be"],2,"By the time + Past Simple → ana cümlede Past Perfect: had been."),
("g-past-perfect","Hardly ____ the office when the phone rang.",["she had left","did she leave","had she left","has she left","she left"],2,"Hardly başta olduğu için devrik yapı gelir ve ilk kısım Past Perfect olur: Hardly had she left ... when."),
("g-past-perfect","By the time we reached the station, the train ____.",["leaves","left","had left","has left","is leaving"],2,"By the time + Past Simple → önce gerçekleşen eylem Past Perfect: had left."),
# Future forms
("g-future-forms","By 2035, scientists ____ a cure for the disease.",["will find","will have found","are finding","found","have found"],1,"'By + gelecekteki yıl' → Future Perfect: will have found."),
("g-future-forms","This time next week, we ____ on a beach in Spain.",["will lie","will be lying","will have lain","lie","lay"],1,"'This time next week' gelecekte belirli bir anda süren eylemi gösterir: Future Continuous."),
("g-future-forms","Please inform me as soon as the results ____ available.",["will be","are","would be","were","being"],1,"As soon as sonrasında gelecek için Present Simple kullanılır: are."),
# Time clause tense
("g-time-clause-tense","I will tell him the news when he ____ tomorrow.",["will come","comes","would come","came","coming"],1,"When zaman bağlacından sonra will kullanılmaz: comes."),
("g-time-clause-tense","I wonder when the manager ____ back from the conference.",["comes","will come","has come","come","coming"],1,"When burada dolaylı soru sözcüğüdür (zaman bağlacı değil); gelecek için will kullanılır: will come."),
("g-time-clause-tense","If the weather ____ bad tomorrow, we will cancel the trip.",["will be","is","would be","were","being"],1,"Ana cümlede will var (1. tip). If cümlesinde will kullanılmaz: is."),
# Passive basic
("g-passive-basic","The new regulations ____ last year.",["introduced","were introduced","have introduced","introduce","were introducing"],1,"Özne düzenlemelerdir ve eylemi yapan belli değil; geçmiş zaman → were introduced."),
("g-passive-basic","The accident ____ at around 3 a.m.",["was happened","happened","has been happened","is happened","was happen"],1,"Happen geçişsiz bir fiildir; passive yapılmaz: happened."),
("g-passive-basic","The bridge ____ at the moment, so drivers must use the alternative route.",["repairs","is repairing","is being repaired","has repaired","was repaired"],2,"Köprü eylemi yapamaz → passive; 'at the moment' → sürekli: is being repaired."),
# Passive special
("g-passive-special","He is said ____ the country before the investigation began.",["to leave","to have left","leaving","having left","that he left"],1,"Söyleme şimdi, olay daha önce: is said to have left."),
("g-passive-special","We had our house ____ last month.",["paint","painted","painting","to paint","to be painted"],1,"Causative: have + nesne + V3 (yaptırmak): painted."),
("g-passive-special","The old building needs ____ before the winter.",["renovate","renovating","to renovating","renovated","being renovate"],1,"Need + V-ing = need to be V3 (pasif anlam): needs renovating."),
# Conditionals
("g-conditionals","If the company ____ earlier, it would have avoided the crisis.",["invested","had invested","would invest","has invested","invests"],1,"Ana cümlede would have avoided (3. tip) var: If + had V3."),
("g-conditionals","If I ____ you, I would reconsider the offer.",["am","were","would be","will be","have been"],1,"2. tip koşul: If + V2 (were), would + V1."),
("g-conditionals","If he had studied harder at university, he ____ a better job now.",["would have","would have had","will have","had","would has"],0,"Karma tip: geçmişteki sebep (had studied), şimdiki sonuç (now): would have."),
# Wish
("g-wish","I wish I ____ the answer, but I have no idea.",["know","knew","had known","would know","have known"],1,"Şimdiki zamanla ilgili dilek: wish + V2 (knew)."),
("g-wish","She regrets not accepting the job. She wishes she ____ it.",["accepted","had accepted","would accept","accepts","has accepted"],1,"Geçmişle ilgili pişmanlık: wish + had V3."),
("g-wish","It is high time the government ____ action against pollution.",["takes","took","will take","has taken","would take"],1,"It is (high) time + özne + Past Simple: took."),
# Subjunctive
("g-subjunctive","The committee recommended that the proposal ____ rejected.",["is","was","be","will be","has been"],2,"Recommend + that + özne + (should) V1: be rejected."),
("g-subjunctive","It is essential that every employee ____ the safety training.",["attends","attended","attend","will attend","is attending"],2,"It is essential that + özne + (should) V1: attend."),
("g-subjunctive","The doctor insisted that the patient ____ complete rest.",["has","have","had","having","to have"],1,"Insist (ısrar / zorunluluk anlamında) + that + özne + V1: have."),
# Modals present
("g-modals-present","You ____ wear a seat belt; it is the law.",["can","may","must","would","might"],2,"Yasal zorunluluk: must."),
("g-modals-present","She ____ be at home. I saw her car outside the house.",["can't","must","needn't","shouldn't","mustn't"],1,"Kanıta dayalı güçlü çıkarım: must be."),
("g-modals-present","You ____ pay to enter the museum; it is free.",["mustn't","don't have to","can't","shouldn't","may not"],1,"Zorunlu değil anlamı: don't have to. Mustn't yasak anlamı taşır."),
# Modals perfect
("g-modals-perfect","The streets are wet. It ____ during the night.",["must rain","must have rained","should have rained","can have rained","would rain"],1,"Geçmişle ilgili güçlü çıkarım: must have V3."),
("g-modals-perfect","He ____ the report yesterday; he was on holiday.",["must have read","can't have read","should have read","might read","needn't read"],1,"Geçmişle ilgili imkânsızlık: can't have V3."),
("g-modals-perfect","You ____ me earlier; I could have helped you.",["should tell","should have told","must have told","may tell","could tell"],1,"Yapılmayan şey için pişmanlık / eleştiri: should have V3."),
# Gerund / infinitive
("g-gerund-infinitive","The manager avoided ____ the journalists' questions.",["to answer","answering","answer","to answering","having answer"],1,"Avoid + V-ing."),
("g-gerund-infinitive","She decided ____ the meeting until next week.",["postponing","to postpone","postpone","to postponing","having postponed"],1,"Decide + to V1."),
("g-gerund-infinitive","We are looking forward to ____ from you.",["hear","hearing","heard","to hear","have heard"],1,"Look forward to kalıbındaki to edattır; V-ing gelir: hearing."),
# Participles
("g-participles","____ the report carefully, the manager approved the budget.",["Having read","Having been read","Being read","Read","To read"],0,"Özne (the manager) eylemi yapıyor ve önce tamamlanan eylem: Having read."),
("g-participles","____ in 1923, the university is one of the oldest in the country.",["Founding","Founded","Having founded","To found","Being founding"],1,"Üniversite kurulandır (pasif anlam): Founded."),
("g-participles","____ down the street, Anna was almost hit by a cyclist.",["Walking","Walked","The cyclist walking","She walked","To walk"],0,"Yürüyen Anna'dır (özne eylemi yapıyor): Walking."),
# Causatives
("g-causatives","We had the contract ____ by a lawyer.",["review","reviewed","reviewing","to review","to be reviewed"],1,"Have + nesne + V3: işi başkasına yaptırmak."),
("g-causatives","The teacher made the students ____ the essay.",["to rewrite","rewrite","rewriting","rewritten","to rewriting"],1,"Make + kişi + V1 (to yok)."),
("g-causatives","She got her brother ____ her car.",["repair","to repair","repairing","repaired","to repairing"],1,"Get + kişi + to V1."),
# Relative clauses
("g-relative-clauses","The scientist ____ research won the prize works at Oxford.",["who","whom","whose","which","that"],2,"İyelik (araştırması) bildirildiği için whose gerekir."),
("g-relative-clauses","The city in ____ she was born has changed a lot.",["that","which","where","what","whom"],1,"Edat + which: in which (edatın ardından that gelmez; where de yanına edat almaz)."),
("g-relative-clauses","He passed the exam, ____ surprised everyone.",["that","which","what","who","it"],1,"Virgülden sonra önceki cümlenin tamamına gönderme yapan which gelir; that kullanılmaz."),
# Reduced relative
("g-reduced-relative","The people ____ outside the building were asked to leave.",["wait","waiting","waited","to wait","having waited"],1,"Kısaltılmış relative clause: people who were waiting → waiting."),
("g-reduced-relative","The books ____ last year are now out of print.",["publishing","published","to publish","having published","publish"],1,"Kitaplar yayımlanandır (pasif): books (which were) published → published."),
("g-reduced-relative","She was the first woman ____ the prize.",["win","winning","to win","won","has won"],2,"The first / last / only + isim + to V1: to win."),
# Noun clauses
("g-noun-clauses","I wonder where ____ yesterday.",["did he go","he went","went he","he goes","has he gone"],1,"Dolaylı soruda düz cümle sırası kullanılır: where he went."),
("g-noun-clauses","It remains unclear ____ the new policy will work.",["that","whether","what","who","unless"],1,"'Belirsiz olan, politikanın işe yarayıp yaramayacağıdır': whether."),
("g-noun-clauses","____ the committee decided has not been announced yet.",["That","What","Whether","Which","Who"],1,"Cümlede 'decided' fiilinin nesnesi eksik; bu eksikliği what tamamlar: What the committee decided."),
# Inversion
("g-inversion","Rarely ____ students realise how much sleep affects their performance.",["do","does","did","realise do","are"],0,"Rarely başta olduğu için yardımcı fiil özneden önce gelir; özne çoğul: do students realise."),
("g-inversion","Not until the final report was published ____ the public learn the truth.",["the public did","did","has","was","had"],1,"Not until ... + devrik ana cümle: did the public learn."),
("g-inversion","No sooner ____ the building than the alarm went off.",["he entered","did he enter","had he entered","has he entered","was he entering"],2,"No sooner + had + özne + V3 ... than + Past Simple."),
# Cleft
("g-cleft","It was in 1999 ____ the company went public.",["when","which","that","what","where"],2,"Cleft cümle: It was + vurgulanan öğe + that."),
("g-cleft","____ I need most is more time.",["That","Which","What","It","Whose"],2,"What I need = ihtiyacım olan şey (pseudo-cleft): What I need most is ..."),
("g-cleft","It was not until midnight ____ the fire was brought under control.",["that","when","which","as","than"],0,"It was not until ... that ... kalıbı."),
# Agreement
("g-agreement","The number of students who study abroad ____ increased dramatically.",["have","has","are","were","having"],1,"The number of + çoğul isim → tekil fiil: has increased."),
("g-agreement","A number of experts ____ criticised the policy.",["has","have","is","was","does"],1,"A number of + çoğul isim → çoğul fiil: have criticised."),
("g-agreement","Economics ____ the study of how societies use scarce resources.",["are","is","were","have been","being"],1,"Economics (bilim dalı adı) tekil sayılır: is."),
# Quantifiers
("g-quantifiers","The campaign failed because ____ people were aware of the risks involved.",["few","a few","little","a little","much"],0,"Başarısızlığın nedeni olumsuz anlamdır (yeterli kişi yok): few."),
("g-quantifiers","Unfortunately, ____ progress has been made in the negotiations.",["little","few","many","a few","several"],0,"Progress sayılamazdır ve olumsuz anlam isteniyor: little."),
("g-quantifiers","There are two proposals; ____ of them is acceptable to the unions.",["both","neither","all","every","some"],1,"İki seçenekten hiçbiri: neither; 'is' tekil fiildir."),
# Comparison
("g-comparison","The population of Istanbul is far larger than ____ of Ankara.",["it","that","those","this","one"],1,"Karşılaştırmada ikinci isim yerine that of (the population) kullanılır."),
("g-comparison","The ____ you practise, the better you become.",["more","most","much","many","more than"],0,"The + comparative, the + comparative: The more ..., the better ..."),
("g-comparison","This laptop is ____ more expensive than the older model.",["very","far","so","too","enough"],1,"Comparative'i far / much / even güçlendirir; very ve so güçlendirmez."),
# Articles
("g-articles","She is ____ unique talent in the field of music.",["an","a","the","(no article)","one"],1,"Unique 'yu' sesiyle başladığı için a kullanılır: a unique."),
("g-articles","Information is ____ power.",["a","an","the","(no article)","one"],3,"Sayılamaz isim genel anlamda kullanılırken article almaz."),
("g-articles","She is ____ honest person who always tells the truth.",["a","an","the","(no article)","one"],1,"Honest sesli harfle (o) başladığı için an kullanılır."),
# Pronouns
("g-pronouns","The two companies have helped ____ for many years.",["themselves","each other","theirs","them","one"],1,"İki taraf birbirine yardım ediyor: each other."),
("g-pronouns","The climate of Spain is warmer than ____ of Britain.",["that","those","it","one","this"],0,"Climate tekil ve sayılamaz; karşılaştırmada that of."),
("g-pronouns","I don't like this phone; I prefer the red ____.",["one","ones","it","that","this"],0,"Tekil sayılabilir isim (phone) yerine one."),
# Prepositions
("g-prepositions","Most of the cases were dependent ____ the testimony of one witness.",["of","on","from","in","with"],1,"Be dependent on."),
("g-prepositions","The new regulations are expected to result ____ a significant reduction in costs.",["from","in","of","with","for"],1,"Result in (sonuç doğurmak) ↔ result from (-den kaynaklanmak)."),
("g-prepositions","The committee spent an hour ____ the budget proposal.",["discussing about","discussing","discuss about","to discuss about","discussed about"],1,"Discuss doğrudan nesne alır; edat gelmez."),
# Parallelism
("g-parallelism","She enjoys reading novels, hiking in the mountains, and ____.",["swim","to swim","swimming","swam","to swimming"],2,"Liste paralel olmalı: reading, hiking, swimming (V-ing)."),
("g-parallelism","The new system is not only faster but also ____.",["cost less","more economical","economically","economy","more economy"],1,"Not only ... but also yapısında iki yan paralel olmalı: faster (sıfat) – more economical (sıfat)."),
("g-parallelism","The policy aims to reduce costs, to improve quality, and ____ customer satisfaction.",["increasing","to increase","increases","increased","have increased"],1,"Liste paralel olmalı: to reduce, to improve, to increase."),
# Adj / adv
("g-adj-adv","The food at that restaurant tastes ____.",["well","good","goodly","nicely","goodness"],1,"Taste bağlayıcı fiildir; sonrasında sıfat gelir: good."),
("g-adj-adv","She works very ____ to finish the project on time.",["hardly","hard","harder","hardness","hardy"],1,"Hard hem sıfat hem zarftır; hardly neredeyse hiç anlamındadır: works hard."),
("g-adj-adv","The task was ____ difficult for the beginners to complete.",["too","enough","so","very","such"],0,"Too + sıfat + for + kişi + to V1: gereğinden fazla zor."),
# Reported speech
("g-reported-speech","He said that he ____ tired and wanted to go home.",["is","was","has been","will be","were being"],1,"Ana fiil geçmiş (said) → yan cümle bir zaman geri gider: was."),
("g-reported-speech","The teacher asked the students where ____.",["did they live","they lived","do they live","they are living","lived they"],1,"Dolaylı soruda düz cümle sırası ve zaman kayması: they lived."),
("g-reported-speech","She denied ____ the confidential documents.",["to take","taking","take","to taking","that taking"],1,"Deny + V-ing."),
# Infinitive structures
("g-infinitive-structures","I am used to ____ up early.",["get","getting","got","to get","have got"],1,"Be used to + V-ing (alışkın olmak)."),
("g-infinitive-structures","You ____ better see a doctor about that cough.",["had","have","would","will","do"],0,"Had better + V1."),
("g-infinitive-structures","It was kind ____ you to lend me the money.",["for","of","to","with","from"],1,"Kişinin karakterini bildiren sıfatlardan sonra of kullanılır: It was kind of you."),
# Strategy
("g-strategy","The manager, together with his assistants, ____ the project's progress every week.",["review","reviews","are reviewing","have reviewed","reviewing"],1,"Together with araya girse de özne tekil (the manager); 'every week' → Present Simple: reviews."),
("g-strategy","The more carefully the samples ____, the more reliable the results will be.",["examine","are examined","examines","has examined","examining"],1,"Samples çoğul ve eylemi yapan değil, yapılan; the more ... passive: are examined."),
("g-strategy","Few people can afford ____ a house in the city centre these days.",["buying","to buy","buy","bought","to buying"],1,"Afford + to V1."),
# Conj vs prep
("g-conj-vs-prep","____ prices rose sharply, demand remained strong.",["Despite","Although","However","Because of","Therefore"],1,"Boşluktan sonra tam cümle var → bağlaç: Although."),
("g-conj-vs-prep","____ the rise in prices, demand remained strong.",["Although","Despite","However","Even though","While"],1,"Boşluktan sonra isim grubu var → edat: Despite."),
("g-conj-vs-prep","Prices rose sharply; ____, demand remained strong.",["although","despite","however","even though","in spite of"],2,"Noktalı virgülden sonra virgülle ayrılan cümleler arası zarf gerekir: however."),
]
