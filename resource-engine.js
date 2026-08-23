(function(){
  const links={
    food:'https://www.feedingillinois.org/get-help-info',
    chicagoFood:'https://www.chicagosfoodbank.org/find-food-2/',
    snap:'https://abe.illinois.gov/',
    meals:'https://ilaging.illinois.gov/programs/nutrition/nutrition.html',
    housing:'https://ilhousingsearch.com/',
    help211:'https://search.211illinois.org/',
    legal:'https://www.illinoislegalaid.org/get-legal-help',
    utilities:'https://dceo.illinois.gov/communityservices/utilitybillassistance/howtoapply.html',
    benefits:'https://benefitscheckup.org/',
    benefitAccess:'https://ilaging.illinois.gov/benefitsaccess.html',
    money:'https://ilaging.illinois.gov/programs/money-mgmt.html',
    abe:'https://abe.illinois.gov/',
    msp:'https://www.medicare.gov/basics/costs/help/medicare-savings-programs',
    extraHelp:'https://www.medicare.gov/basics/costs/help/drug-costs',
    ship:'https://ilaging.illinois.gov/ship.html',
    planCompare:'https://www.medicare.gov/plan-compare/'
  };

  const slug=value=>String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const make=(category,title,text,url,priority,source,reason,actionLabel='Open resource',role='Next step')=>({category,title,text,url,priority,source,reason,actionLabel,role,id:slug(`${category}-${title}`)});

  function food(state,member){
    const chicago=String(state.zip||'').startsWith('606');
    const snapKnown=member?.coverage?.snap;
    return [
      make('Food',chicago?'Find food near you':'Find food in your area',chicago?'Search Chicago pantries and meal sites.':'Search Illinois food resources by location.',chicago?links.chicagoFood:links.food,1,chicago?'Greater Chicago Food Depository':'Feeding Illinois','Best first step for nearby food.','Find food','Start here'),
      make('Food',snapKnown==='Yes'?'Review your SNAP benefits':'Check SNAP benefits',snapKnown==='Yes'?'You already marked SNAP in your profile.':'SNAP may help with monthly groceries.',links.snap,2,'Illinois ABE',snapKnown==='Yes'?'Keep your food benefits current.':'Check longer-term grocery assistance.','Check SNAP','Ongoing help'),
      make('Food','Check senior meal programs','Illinois offers senior nutrition programs.',links.meals,3,'Illinois Department on Aging','Useful for ongoing meal support.','See meal programs','Also useful')
    ];
  }

  function housing(state,member){
    const housingKnown=member?.coverage?.housing;
    return [
      make('Housing','Get local housing guidance','Find housing and shelter services near you.',links.help211,1,'211 Illinois','Best starting point when you are unsure where to go.','Find local help','Start here'),
      make('Housing','Search affordable housing','Search affordable Illinois rental listings.',links.housing,2,'ILHousingSearch',housingKnown==='Yes'?'Review housing options already important to you.':'Best for finding longer-term housing options.','Search housing','Find housing'),
      make('Housing','Get renter or eviction help','Find free Illinois legal assistance.',links.legal,3,'Illinois Legal Aid','Use this for eviction or landlord problems.','Get legal help','Protect your housing')
    ];
  }

  function bills(state,member){
    const utilityKnown=member?.coverage?.utilities;
    return [
      make('Bills',utilityKnown==='Yes'?'Review utility assistance':'Check utility assistance','Illinois programs may lower energy costs.',links.utilities,1,'Illinois DCEO',utilityKnown==='Yes'?'Keep your current utility help on track.':'Start with programs for gas and electric bills.','Check utility help','Start here'),
      make('Bills','Find other local bill help','Search nearby household assistance.',links.help211,2,'211 Illinois','Use this for bills beyond utilities.','Find local help','More help')
    ];
  }

  function money(state,member){
    const hasHousehold=Boolean(member?.household?.income||member?.household?.size);
    return [
      make('Money & Benefits','Check Illinois senior discounts','Check Ride Free and license plate benefits.',links.benefitAccess,1,'Illinois Department on Aging','A focused Illinois benefit for eligible seniors.','Check Benefit Access','Start here'),
      make('Money & Benefits','Check other benefits','Screen for additional assistance programs.',links.benefits,2,'BenefitsCheckUp',hasHousehold?'Your saved household details can guide screening.':'Look for programs that may lower monthly costs.','Check benefits','Find savings'),
      make('Money & Benefits','Get money management help','Get help with budgeting and bill organization.',links.money,3,'Illinois Department on Aging','Useful when managing bills feels difficult.','Get money help','Also useful')
    ];
  }

  function healthcare(state,member){
    const medicare=state.medicare||member?.coverage?.medicare||'';
    const medicaid=state.medicaid||member?.coverage?.medicaid||'';
    const lis=member?.coverage?.lis||'';
    const msp=member?.coverage?.msp||'';
    if(medicare==='Yes')return [
      make('Healthcare',msp==='Yes'?'Review your Medicare Savings Program':'Check Medicare Savings Programs',msp==='Yes'?'Keep your Medicare cost assistance current.':'You may qualify for help with Medicare costs.',links.msp,1,'Medicare.gov',msp==='Yes'?'Protect savings you already receive.':'Check premium and cost-sharing help first.','Check Medicare savings','Start here'),
      make('Healthcare',lis==='Yes'?'Review your Extra Help':'Check Extra Help',lis==='Yes'?'Keep your prescription assistance current.':'You may qualify for lower prescription costs.',links.extraHelp,2,'Medicare.gov',lis==='Yes'?'Protect drug savings you already receive.':'Check prescription assistance before changing coverage.','Check drug savings','Lower drug costs'),
      make('Healthcare','Review your Medicare coverage','Compare how Medicare options handle costs and benefits.',links.planCompare,3,'Medicare.gov','Your plan can affect doctors, drugs, and yearly costs. Changing plans is not always needed.','Review Medicare options','Coverage check'),
      make('Healthcare','Get independent Medicare counseling','Illinois SHIP offers free Medicare counseling.',links.ship,4,'Illinois SHIP','Use this when you want independent counseling.','Visit Illinois SHIP','Independent help')
    ];
    if(medicaid==='Yes')return [
      make('Healthcare','Manage Illinois Medicaid','Use Illinois ABE for health coverage.',links.abe,1,'Illinois ABE','Keep your Illinois health coverage current.','Open Illinois ABE','Start here'),
      make('Healthcare','Find local healthcare help','Search nearby health services.',links.help211,2,'211 Illinois','Find local care and support services.','Find local help','More help')
    ];
    return [
      make('Healthcare','Check Illinois health coverage','Illinois ABE handles Medicaid applications.',links.abe,1,'Illinois ABE','Start by checking available health coverage.','Check coverage','Start here'),
      make('Healthcare','Check Medicare cost help','Savings programs may reduce Medicare costs.',links.msp,2,'Medicare.gov','Useful if you have Medicare or are becoming eligible.','Check Medicare help','Medicare help'),
      make('Healthcare','Find local healthcare help','Search nearby health services.',links.help211,3,'211 Illinois','Find local care and support services.','Find local help','More help')
    ];
  }

  function recommendations(state,member){
    const byCategory={Food:food(state,member),Housing:housing(state,member),Bills:bills(state,member),'Money & Benefits':money(state,member),Healthcare:healthcare(state,member)};
    return (state.needs||[]).flatMap(name=>byCategory[name]||[]);
  }

  window.SeniorHelpersEngine={recommendations,links};
})();
