(function(){
  const links={
    food:'https://www.feedingillinois.org/get-help-info',
    chicagoFood:'https://www.chicagosfoodbank.org/find-food-2/',
    snap:'https://abe.illinois.gov/',
    meals:'https://ilaging.illinois.gov/programs/nutrition/nutrition.html',
    housing:'https://ilhousingsearch.com/',
    help211:'https://search.211illinois.org/',
    legal:'https://www.illinoislegalaid.org/get-legal-help',
    utilities:'https://dceo.illinois.gov/communityservices/homeweatherization/communityactionagencies/helpillinoisfamilies.html',
    benefits:'https://benefitscheckup.org/',
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
      make('Housing','Search affordable housing','Search affordable Illinois rental listings.',links.housing,2,'ILHousingSearch','Best for finding longer-term housing options.','Search housing','Find housing'),
      make('Housing','Get renter or eviction help','Find free Illinois legal assistance.',links.legal,3,'Illinois Legal Aid','Use this for eviction or landlord problems.','Get legal help','Protect your housing')
    ].map(item=>housingKnown==='Yes'&&item.priority===2?{...item,text:'Review affordable housing options you saved.'}:item);
  }

  function bills(){return [
    make('Bills','Check utility assistance','Help may lower utility costs.',links.utilities,1,'Help Illinois Families','Start with energy and utility help.','Check bill help','Start here'),
    make('Bills','Find local bill help','Search nearby assistance programs.',links.help211,2,'211 Illinois','Find other local bill programs.','Find local help','More help')
  ]}
  function money(){return [
    make('Money & Benefits','Check available benefits','Screen for senior assistance programs.',links.benefits,1,'BenefitsCheckUp','See which benefits may fit.','Check benefits','Start here'),
    make('Money & Benefits','Get money management help','Illinois offers senior money support.',links.money,2,'Illinois Department on Aging','Get help organizing household money.','Get money help','Also useful')
  ]}
  function healthcare(state){
    if(state.medicare==='Yes')return [
      make('Healthcare','Check Medicare Savings Programs','You may lower Medicare costs.',links.msp,1,'Medicare.gov','Check premium and cost-sharing help.','Check savings','Start here'),
      make('Healthcare','Check Extra Help','You may lower prescription costs.',links.extraHelp,2,'Medicare.gov','Check prescription assistance.','Check drug help','Next'),
      make('Healthcare','Get Medicare counseling','SHIP offers free Medicare help.',links.ship,3,'Illinois SHIP','Get independent Medicare counseling.','Visit SHIP','Also useful')
    ];
    if(state.medicaid==='Yes')return [
      make('Healthcare','Manage Illinois Medicaid','Use Illinois ABE for coverage.',links.abe,1,'Illinois ABE','Manage your Illinois health benefits.','Open ABE','Start here'),
      make('Healthcare','Find local healthcare help','Search nearby health services.',links.help211,2,'211 Illinois','Find local healthcare support.','Find local help','Next')
    ];
    return [
      make('Healthcare','Check health coverage help','Illinois ABE handles applications.',links.abe,1,'Illinois ABE','Start with available health coverage.','Check coverage','Start here'),
      make('Healthcare','Check Medicare cost help','Savings programs may reduce costs.',links.msp,2,'Medicare.gov','Review Medicare assistance if eligible.','Check Medicare help','Next'),
      make('Healthcare','Find local healthcare help','Search nearby health services.',links.help211,3,'211 Illinois','Find local healthcare support.','Find local help','Also useful')
    ];
  }

  function recommendations(state,member){
    const byCategory={Food:food(state,member),Housing:housing(state,member),Bills:bills(state,member),'Money & Benefits':money(state,member),Healthcare:healthcare(state,member)};
    return (state.needs||[]).flatMap(name=>byCategory[name]||[]);
  }

  window.SeniorHelpersEngine={recommendations,links};
})();
