var HEADINGS=[
 ["A","Leisure and sport","Bo'sh vaqt va sport"],
 ["B","Geography","Geografiya"],
 ["C","Economic outlook","Iqtisodiy istiqbol"],
 ["D","National language","Milliy til"],
 ["E","Customs and traditions","Urf-odat va an'analar"],
 ["F","Freedom of media","Ommaviy axborot erkinligi"],
 ["G","Public transport","Jamoat transporti"],
 ["H","Modern history","Zamonaviy tarix"]
];
var QS=[
 {q:"Q1",ans:"B",why:"Joylashuv, chegaralar, relyef va daryolar haqida (Baltic coast, borders, landscape, rivers).",
  t:"Lithuania is situated on the eastern Baltic coast and borders Latvia in the north, the Kaliningrad region of the Russian Federation and Poland in the southwest, and Belarus in the southwest and east. The geometrical centre of Europe lies in eastern Lithuania 25km north of its capital Vilnius. The landscape varies between lowland plains and hilly uplands and has a complex network of rivers."},
 {q:"Q2",ans:"C",why:"Sanoat, qishloq xo'jaligi, tashqi savdo (industrial base, agriculture, foreign trade).",
  t:"Lithuania has historically been the least developed of the Baltic republics, with a smaller industrial base and greater dependence on agriculture. Sugar beet, cereals, potatoes and vegetables are the main crops. Lithuania's foreign trade has gradually changed during the 1990s, and now the European Union, not Russia, is its main trading partner."},
 {q:"Q3",ans:"D",why:"Litva tili, ona tili, shevalar (mother tongue, official languages, dialects).",
  t:"Lithuanian is the mother tongue for 80% of the population. After the country joined the European Union in 2004 this language has become one of the EU official languages. Lithuania has a large number of dialects for such a small territory, including High Lithuanian and Low Lithuanian."},
 {q:"Q4",ans:"A",why:"Ta'til, sayr va sport turlari (vacation, hiking, sailing, windsurfing, gliding).",
  t:"Lithuania offers different opportunities for a nice vacation. You can explore a range of large sand dunes and pine forests while hiking in the Curonian Spit National Park, take part in some action sports in Nida, a village that makes a true paradise for sailing, windsurfing, paragliding and kiting, or try out more extreme sports, such as hot-air ballooning and gliding."},
 {q:"Q5",ans:"E",why:"Folklor, bayramlar, an'anaviy taomlar (folklore, Mardi Gras, traditional dishes).",
  t:"Those who are interested in folklore may enjoy their stay in Lithuania in any season of the year. The Mardi Gras celebrations are held in various Lithuanian cities and small towns at the beginning of February. The Folklore Festival is held in Vilnius' Old Town during May. There you can see craft fairs, taste traditional dishes, join song and parties and listen to psalms."},
 {q:"Q6",ans:"F",why:"Televideniye, radio, gazetalar, davlatdan mustaqillik (TV, radio, newspapers, independently of the state).",
  t:"Lithuania's TV market is dominated by commercial channels. The radio market is similarly competitive. Lithuania's media are free and operate independently of the state, and there are no government-owned newspapers. However, politicians do occasionally attempt to influence editorial policy."}
];

/* Tayyor tarjimalar: avto-to'ldirish shularni qo'llaydi */
var SUG={
 "situated":"joylashgan","eastern":"sharqiy","baltic":"Boltiqbo'yi","coast":"qirg'oq","borders":"chegaradosh","latvia":"Latviya",
 "north":"shimol","kaliningrad":"Kaliningrad","region":"viloyat, hudud","russian":"Rossiya","federation":"federatsiya","poland":"Polsha",
 "southwest":"janubi-g'arb","belarus":"Belarus","east":"sharq","geometrical":"geometrik","centre":"markaz","europe":"Yevropa",
 "lies":"joylashgan","capital":"poytaxt","landscape":"manzara, relyef","varies":"turlicha bo'ladi","lowland":"pasttekislik",
 "plains":"tekisliklar","hilly":"tepalikli","uplands":"qirlar, balandliklar","complex":"murakkab","network":"tarmoq","rivers":"daryolar",
 "historically":"tarixan","least":"eng kam","developed":"rivojlangan","republics":"respublikalar","smaller":"kichikroq","industrial":"sanoat",
 "base":"asos","greater":"kattaroq","dependence":"qaramlik","agriculture":"qishloq xo'jaligi","sugar":"shakar","beet":"lavlagi",
 "cereals":"don ekinlari","potatoes":"kartoshka","vegetables":"sabzavotlar","main":"asosiy","crops":"ekinlar","foreign":"xorijiy, tashqi",
 "trade":"savdo","gradually":"asta-sekin","changed":"o'zgardi","during":"davomida","european":"Yevropa","union":"ittifoq",
 "trading":"savdo","partner":"hamkor",
 "mother":"ona","tongue":"til","population":"aholi","joined":"qo'shildi","official":"rasmiy","languages":"tillar","large":"katta",
 "number":"son","dialects":"shevalar","territory":"hudud","including":"jumladan","high":"yuqori","low":"quyi",
 "offers":"taklif qiladi","different":"turli","opportunities":"imkoniyatlar","vacation":"ta'til","explore":"kashf etmoq, sayr qilmoq",
 "range":"qator, turkum","sand":"qum","dunes":"barxanlar","pine":"qarag'ay","forests":"o'rmonlar","hiking":"piyoda sayr",
 "curonian":"Kuron","spit":"qum tili","national":"milliy","park":"bog'","action":"harakatli","sports":"sport turlari","village":"qishloq",
 "paradise":"jannat","sailing":"yelkanli suzish","windsurfing":"vindserfing","paragliding":"paraplan uchish","kiting":"kayting",
 "extreme":"o'ta xavfli, ekstremal","hot-air":"issiq havoli","ballooning":"sharda uchish","gliding":"planerda uchish",
 "interested":"qiziqadigan","folklore":"folklor","enjoy":"zavqlanmoq","stay":"turish, qolish","season":"fasl","mardi":"Mardi","gras":"Gras",
 "celebrations":"bayramlar","held":"o'tkaziladi","various":"turli","cities":"shaharlar","towns":"shaharchalar","beginning":"boshlanish",
 "february":"fevral","festival":"festival","old":"eski","town":"shahar","may":"may (oy)","craft":"hunarmandchilik","fairs":"yarmarkalar",
 "taste":"tatib ko'rmoq","traditional":"an'anaviy","dishes":"taomlar","join":"qo'shilmoq","song":"qo'shiq","parties":"ziyofatlar",
 "listen":"tinglamoq","psalms":"diniy qo'shiqlar",
 "market":"bozor","dominated":"hukmron","commercial":"tijoriy","channels":"kanallar","radio":"radio","similarly":"xuddi shunday",
 "competitive":"raqobatli","media":"ommaviy axborot vositalari","free":"erkin","operate":"faoliyat yuritmoq","independently":"mustaqil",
 "state":"davlat","government-owned":"hukumatga tegishli","newspapers":"gazetalar","however":"biroq","politicians":"siyosatchilar",
 "occasionally":"ba'zan","attempt":"urinmoq","influence":"ta'sir qilmoq","editorial":"tahririyat","policy":"siyosat"
};
/* Oddiy so'zlar: bosganda taklif sifatida chiqadi, avto-to'ldirishda qo'llanmaydi */
var EASY={
 "lithuania":"Litva","lithuanian":"litvacha, litvalik","vilnius":"Vilnyus","nida":"Nida","russia":"Rossiya","eu":"Yevropa Ittifoqi",
 "and":"va","the":"","of":"ning","in":"da, ichida","on":"da, ustida","is":"-dir","are":"-dir","has":"bor","have":"bor","been":"bo'lgan",
 "between":"orasida","with":"bilan","than":"-dan ko'ra","now":"hozir","not":"emas","its":"uning","there":"u yerda","no":"yo'q","by":"tomonidan",
 "who":"kim","those":"o'sha","any":"har qanday","at":"da","for":"uchun","from":"dan","you":"siz","can":"qila olmoq","such":"shunday",
 "small":"kichik","some":"ba'zi","or":"yoki","more":"ko'proq","year":"yil","one":"bir","true":"haqiqiy","try":"urinib ko'rmoq","out":"tashqariga",
 "see":"ko'rmoq","makes":"qiladi","do":"qilmoq","while":"paytida","take":"olmoq","part":"qism","country":"mamlakat","after":"keyin",
 "become":"bo'lmoq","language":"til","trade":"savdo","km":"km","tv":"televizor","eu's":"Yevropa Ittifoqining","those":"o'shalar",
 "may":"may (oy)","their":"ularning","he":"u","was":"edi","a":"bir","an":"bir","as":"kabi","to":"ga"
};
