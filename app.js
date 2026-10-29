(function(){
  var PHONE='201044360405', NUM='01044360405', MAILKEY='74bf3273-4457-49fb-91d1-a0b78e54319a';
  var P={facebook:{ar:'فيسبوك',price:200},tiktok:{ar:'تيك توك',price:200},instagram:{ar:'انستجرام',price:200},snapchat:{ar:'سناب شات',price:200},other:{ar:'حاجة تانية',price:200},google:{ar:'جوجل',price:1000}};
  var current='';
  var seg=document.querySelectorAll('.seg button');
  var sel=document.getElementById('platformSelect');
  var total=document.getElementById('total');
  var cards=document.querySelectorAll('.card');
  function setPlatform(p){
    current=p||'';
    seg.forEach(function(b){b.setAttribute('aria-checked',b.dataset.platform===current?'true':'false')});
    cards.forEach(function(c){c.classList.toggle('on',c.dataset.platform===current)});
    var g=current==='google';
    document.getElementById('gPanel').hidden=!g;
    document.getElementById('flow').hidden=g; document.getElementById('orderBox').classList.toggle('gmode',g);
    if(g){document.getElementById('thanks').hidden=true;total.innerHTML='جوجل: <b>1000</b> جنيه';return}
    if(sel.value!==current) sel.value=current;
    document.getElementById('otherWrap').hidden=current!=='other';
    if(current){total.innerHTML='المبلغ المطلوب: <b>'+P[current].price+'</b> جنيه ('+P[current].ar+')';sel.removeAttribute('aria-invalid')}
    else total.textContent='اختار عشان يظهر المبلغ';
  }
  seg.forEach(function(b){b.addEventListener('click',function(){setPlatform(b.dataset.platform)})});
  cards.forEach(function(c){c.addEventListener('click',function(){setPlatform(c.dataset.platform);document.getElementById('order').scrollIntoView({behavior:'smooth',block:'start'})})});
  sel.addEventListener('change',function(){setPlatform(sel.value)});
  var m=location.hash.match(/^#(facebook|tiktok|instagram|snapchat|other|google)$/); if(m){setPlatform(m[1])}

  var copyBtn=document.getElementById('copyBtn');
  copyBtn.addEventListener('click',function(){
    function ok(){copyBtn.textContent='اتنسخ ✓';copyBtn.classList.add('done');setTimeout(function(){copyBtn.textContent='نسخ الرقم';copyBtn.classList.remove('done')},2000)}
    function fallback(){var t=document.createElement('textarea');t.value=NUM;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();t.setSelectionRange(0,99);try{document.execCommand('copy')}catch(e){}document.body.removeChild(t);ok()}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(NUM).then(ok,fallback)}else fallback();
  });

  var form=document.getElementById('orderForm'), err=document.getElementById('formErr'), thanks=document.getElementById('thanks'),
      fail=document.getElementById('sendFail'), sendBtn=document.getElementById('sendBtn'), retryBtn=document.getElementById('retryBtn');
  function digits(s){return (s||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/[^\d+]/g,'')}
  function newCid(){try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,12)}
  var cid=null, lastSig='', sending=false;
  function collect(){
    var f=form.elements;
    return {name:f.name.value.trim(), whatsapp:digits(f.whatsapp.value), email:f.email.value.trim(),
      platform:f.platform.value, other:(f.other.value||'').trim(), method:(form.querySelector('input[name=method]:checked')||{}).value||'فودافون كاش',
      ref:f.ref.value.trim(), sender:digits(f.sender.value), company:(f.company&&f.company.value)||''};
  }
  function check(d){
    var f=form.elements, bad=[];
    [f.name,f.whatsapp,f.email,f.platform,f.other,f.sender].forEach(function(i){i.removeAttribute('aria-invalid')});
    if(!d.name) bad.push([f.name,'اكتب اسمك']);
    if(d.whatsapp.replace(/\D/g,'').length<10) bad.push([f.whatsapp,'رقم الواتساب مش مظبوط']);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad.push([f.email,'الإيميل مش مظبوط، المعلومة هتوصلك عليه']);
    if(!P[d.platform]||d.platform==='google') bad.push([f.platform,'اختار بتدفع ضريبة على إيه']);
    if(d.platform==='other'&&!d.other) bad.push([f.other,'اكتب بتدفع ضريبة على إيه']);
    if(d.sender.replace(/\D/g,'').length<10) bad.push([f.sender,'اكتب الرقم اللي حوّلت منه']);
    if(bad.length){bad.forEach(function(b){b[0].setAttribute('aria-invalid','true')});err.textContent=bad[0][1];err.hidden=false;bad[0][0].focus();return false}
    err.hidden=true; return true;
  }
  function busy(on){sending=on;sendBtn.setAttribute('aria-busy',on?'true':'false');sendBtn.disabled=on;retryBtn.disabled=on;
    sendBtn.textContent=on?'جاري الإرسال…':'ابعت الطلب';retryBtn.textContent=on?'جاري الإرسال…':'جرّب تاني'}
  function send(){
    if(sending) return;
    var d=collect(); if(!check(d)) return;
    var sig=JSON.stringify(d); if(!cid||sig!==lastSig){cid=newCid();lastSig=sig}
    d.cid=cid; fail.hidden=true; busy(true);
    function failed(){busy(false);fail.hidden=false;fail.scrollIntoView({behavior:'smooth',block:'center'})}
    function done(id){
      busy(false);
      if(id&&id!=='CM-0'){document.getElementById('orderId').textContent=id;document.getElementById('orderNo').hidden=false}
      form.hidden=true; thanks.hidden=false; cid=null;
      thanks.focus({preventScroll:true}); thanks.scrollIntoView({behavior:'smooth',block:'center'});
    }
    function post(url,body,ms){
      var ctl=window.AbortController?new AbortController():null, t=setTimeout(function(){if(ctl)ctl.abort()},ms||25000);
      return fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
        .then(function(r){clearTimeout(t);return r.json().catch(function(){return {}})},function(e){clearTimeout(t);throw e});
    }
    // GitHub Pages copy: static only, so the order mail is built here and sent straight to Web3Forms.
    var o=P[d.platform], now=new Date(), id='CM-'+now.getTime().toString(36).slice(-5).toUpperCase(), cairo='';
    try{cairo=now.toLocaleString('en-GB',{timeZone:'Africa/Cairo'})}catch(e){cairo=now.toISOString()}
    var m={access_key:MAILKEY, botcheck:'', subject:'طلب إزالة ضريبة – '+d.name+' – '+o.price+' جنيه', from_name:'موقع إزالة الضريبة – CM Agency'};
    m['رقم الطلب']=id; m['الاسم']=d.name; m['رقم الواتساب']=d.whatsapp; m['الإيميل']=d.email;
    m['بيدفع ضريبة على']=d.platform==='other'?d.other:o.ar; m['المبلغ']=o.price+' جنيه'; m['طريقة التحويل']=d.method;
    m['حوّل من رقم']=d.sender; m['رقم العملية']=d.ref||'—'; m['وقت الطلب (القاهرة)']=cairo; m['المصدر']='GitHub';
    if(d.company){ done('CM-0'); return } // honeypot
    post('https://api.web3forms.com/submit',m,25000).then(function(r){
      if(r&&(r.success===true||r.success==='true')) done(id); else failed();
    }).catch(failed);
  }
  form.addEventListener('submit',function(e){e.preventDefault();send()});
  retryBtn.addEventListener('click',send);
})();
