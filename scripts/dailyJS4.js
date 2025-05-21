var timerIdn = setInterval(check, 100);
function check() {
    if ((typeof(stage) !== 'undefined') && (typeof(stage.pole) !== 'undefined') && (typeof(stage.pole.onMouseMoveFlash) === "function")) {
		clearInterval(timerIdn);
		if (typeof(setshadAbs) !== 'undefined') {
			return 0;
		}		
		if (document.getElementById("play_button").style.display == 'none') {
			window.gpause = false;
		}		
		stage.pole.attackmonster = function(attacker, ax, ay, x, y, defender, shootok, koef, inuse){
			console.log("arra");
			var mainattack=1;
			var ax1=ax;
			var ay1=ay;
			if (defender==1000) return 0;
			if (defender<=0) return 0;
			if (!this.obj[defender]) return 0;
			if (this.obj[defender]['hero']) return 0;
			if (this.obj[defender]['rock']) return 0;
			if (shootok==undefined) shootok=0;
			if (koef==undefined) koef=1;
			if (inuse==undefined) inuse='';
			var len=wmap2[y*defxn+x];
			if ((this.obj[attacker].x==x)&&(this.obj[attacker].y==y)) len=spd;

			if (this.obj[attacker]['big']){
				if (ax>x){x++;};
				if (ay>y){y++;};
			};
			if (this.obj[attacker]['bigx']){
				if (ax>x){x++;};
			};
			if (this.obj[attacker]['bigy']){
				if (ay>y){y++;};
			};
			
			var spd=Math.max(0, Math.round((this.obj[attacker].speed+this.obj[attacker]['ragespeed']+this.obj[attacker]['speedaddon'])*this.obj[attacker].speedmodifier));
			if (magic[attacker]['ent']){spd=0;};
			var movelen=spd-len;

			attacker_c=attacker; ax_c=ax; ay_c=ay; x_c=x; y_c=y; defender_c=defender; shootok_c=shootok; 
			
			//nowturn_c=nowturn;

			if ((x==0)&&(y==0)){
				var x=this.obj[attacker]['x'];
				var y=this.obj[attacker]['y'];
			};
			

			if ((defender>0)&&(this.obj[defender]['big'])){
				if ((x-ax>1)&&(ax<x)&&(defender==mapobj[ay*defxn+ax+1])){ax++;};
				if ((y-ay>1)&&(ay<y)&&(defender==mapobj[(ay+1)*defxn+ax])){ay++;};
				if ((ax-x>1)&&(ax>x)&&(defender==mapobj[ay*defxn+ax-1])){ax--;};
				if ((ay-y>1)&&(ay>y)&&(defender==mapobj[(ay-1)*defxn+ax])){ay--;};
			};
			if ((defender>0)&&(this.obj[defender]['bigx'])){
				if ((x-ax>1)&&(ax<x)&&(defender==mapobj[ay*defxn+ax+1])){ax++;};
				if ((ax-x>1)&&(ax>x)&&(defender==mapobj[ay*defxn+ax-1])){ax--;};
			};
			if ((defender>0)&&(this.obj[defender]['bigy'])){
				if ((y-ay>1)&&(ay<y)&&(defender==mapobj[(ay+1)*defxn+ax])){ay++;};
				if ((ay-y>1)&&(ay>y)&&(defender==mapobj[(ay-1)*defxn+ax])){ay--;};
			};
			dx=x-ax;
			dy=y-ay;
			l=dx*dx+dy*dy;
			


		   if (movelen==undefined) movelen=0;;
		   
		   PhysicalModifiers=1;
		   PhysicalModifiers*=koef;
		   if (this.obj[attacker]['shadowattack']) l=0;
		   var hera=0;
		   var herd=0;
			var len = this.obj_array.length;
			for (var k1=0;k1<len;k1++)
			{
				k = this.obj_array[k1];
				if ((this.obj[k].hero)&&(this.obj[k].owner==this.obj[attacker].owner)) hera=k;
				if ((this.obj[k].hero)&&(this.obj[k].owner==this.obj[defender].owner)) herd=k;
			};
		   
			if ((this.obj[defender]['pirate'])&&((magic[defender]['sea'])||(gtype==125)||(gtype==126)||(gtype==133))){
				PhysicalModifiers*=0.85;
			};



			if (this.obj[defender]['deadflesh']){
				PhysicalModifiers*=0.8;
			};
			if (this.obj[defender]['immaterial']){
				PhysicalModifiers*=0.65;
			};

			if ((this.obj[attacker]['oppressionofweak'])&&(this.obj[defender]['level']==1)){
				PhysicalModifiers*=1.5;
			};
			if ((this.obj[attacker]['fearofstrong'])&&(this.obj[defender]['level']==7)){
				PhysicalModifiers*=0.5;
			}; 

		   
		   if ((hera>0)&&(magic[hera]['bna'])){
				PhysicalModifiers=PhysicalModifiers*(1+magic[hera]['bna']['effect']/100);
				if ((this.obj[defender]['mechanical'])&&(magic[hera]['MEC'])){
					PhysicalModifiers*=1+magic[hera]['MEC']['effect']/100;
				};	
				if ((this.obj[attacker]['mechanical'])&&(magic[hera]['mch'])){
					PhysicalModifiers*=1+magic[hera]['mch']['effect']/100;
				};	
			};
			if ((this.obj[defender]['building'])&&(!this.obj[attacker]['siegewalls'])){
				PhysicalModifiers*=0.05;
			};
			
			if ((defender>0)&&(this.obj[attacker]['cruelty'])&&((this.obj[defender]['nowhealth']<this.obj[defender]['maxhealth'])||(this.obj[defender]['nownumber']<this.obj[defender]['maxnumber']))){
					PhysicalModifiers*=1.15;
			};
			
			if ((defender>0)&&(this.obj[attacker]['morecruelty'])&&((this.obj[defender]['nowhealth']<this.obj[defender]['maxhealth'])||(this.obj[defender]['nownumber']<this.obj[defender]['maxnumber']))){
					PhysicalModifiers*=1.3;
			}; 
			

			if ((this.obj[attacker]['giantkiller'])&&(this.obj[defender]['big'])) PhysicalModifiers*=2;
			if ((this.obj[attacker]['pygmykiller'])&&(!this.obj[defender]['big'])) PhysicalModifiers*=1.33;
			
			if (this.obj[attacker]['stormstrike'])PhysicalModifiers*=2;

			if ((this.obj[attacker]['undeadkiller'])&&(this.obj[defender]['undead'])) PhysicalModifiers*=1.5;

			if ((this.obj[attacker]['pirate'])&&(magic[defender]['blb'])) PhysicalModifiers*=1.5;


			if ((!this.obj[attacker]['hero'])&&(magic[attacker]['zat'])&&(magic[attacker]['zat']['effect']>0)){
				PhysicalModifiers*=1.15;
			};


			if ((herd>0)&&(magic[herd]['bnd'])){
				PhysicalModifiers=PhysicalModifiers/(1+magic[herd]['bnd']['effect']/100);
			};
			if ((herd>0)&&(magic[herd]['fld'])){
				PhysicalModifiers=PhysicalModifiers*(1-magic[herd]['fld']['effect']/100);
			};
			if ((herd>0)&&(magic[herd]['rcd'])&&(monster_race[this.obj[attacker]['id']]==magic[herd]['rcd']['effect'])){
				PhysicalModifiers=PhysicalModifiers*0.93;
			};
			
			if (magic[attacker]['prp']){
				PhysicalModifiers=PhysicalModifiers*(1+magic[attacker]['prp']['effect']/100);
			};
			if (magic[defender]['sta']){
				PhysicalModifiers*=0.5;
			};

			if ((magic[attacker]['chd'])&&(this.obj[magic[attacker]['chd']['effect']]['nownumber']>0)&&(magic[attacker]['chd']['effect']!=defender)){
				PhysicalModifiers*=0.55;
			};

			PhysicalModifiers*=this.checkmembrane(defender);

			if (!this.obj[attacker]['hero']){
				if ((l<=2)&&(this.obj[attacker]['shooter'])&&(!this.obj[attacker]['nopenalty'])&&(!this.obj[attacker]['warmachine'])&&(!this.obj[attacker].shadowattack)){PhysicalModifiers=PhysicalModifiers*0.5;};
				if ((l>2)&&(this.obj[attacker]['rangepenalty'])){PhysicalModifiers=PhysicalModifiers*0.5;};
				rangemod=1;
				if ((l>2)&&(this.obj[attacker]['shooter'])&&(((this.obj[attacker]['range']<Math.sqrt(l))&&(!this.obj[attacker].shadowattack))||
				 ((iswalls)&&(!this.obj[attacker]['hero'])&&(checkwall(x,y,ax,ay))))){
					PhysicalModifiers=PhysicalModifiers*0.5;rangemod=0.5;};
				if ((l>2)&&(this.obj[attacker]['shooter'])&&(iswalls2)&&(!this.obj[attacker]['hero'])&&(((!this.obj[attacker].siegewalls)||(btype==118))||(!this.obj[defender].stone))&&(checkwall2(x,y,ax,ay,attacker))){
					PhysicalModifiers=PhysicalModifiers*0.5;rangemod*=0.5;};
			};
			var _PERK_ARCHERY=11;
			var _PERK_EVASION=22;
			
		   if ((defender>0)&&(this.obj[defender]['dodge'])&&(((l<=2)&&(!this.obj[attacker]['ballista'])&&(inuse!='ssh')&&(inuse!='mga')&&(inuse!='dcd')&&(inuse!='chs')&&(!this.obj[attacker]['hero']))||(inuse=='brs')||(inuse=='cpt'))){
			  PhysicalModifiers *= 0.5;
		   };

			console.log(shootok);
			if (((l>2)||(shootok==1))&&(!this.obj[attacker]['hero'])&&(this.obj[attacker]['shooter'])&&(!this.obj[attacker]['shadowattack'])){
				if (isperk(attacker,_PERK_ARCHERY)) PhysicalModifiers*=1.2;
				if (isperk(defender,_PERK_EVASION)) PhysicalModifiers*=0.8;
				
				if ((!this.obj[defender]['lshield'])&& (this.shieldother(defender)) )
							{PhysicalModifiers=PhysicalModifiers*0.75;};

				if ((this.obj[defender]['lshield'])||(this.obj[defender]['hollowbones']))
							{PhysicalModifiers=PhysicalModifiers*0.5;};
				if (this.obj[defender]['diamondarmor'])
							{PhysicalModifiers=PhysicalModifiers*0.1;};

				if (this.obj[defender]['shielded'])
							{PhysicalModifiers=PhysicalModifiers*0.75;};
				if (this.obj[defender]['unprotectedtarget'])
							{PhysicalModifiers=PhysicalModifiers*1.25;};
				if (magic[defender]['dfm'])
					{PhysicalModifiers=PhysicalModifiers*(1-magic[defender]['dfm']['effect']/100);};
					
				if (magic[attacker]['cnf'])
					{PhysicalModifiers=PhysicalModifiers*(1-magic[attacker]['cnf']['effect']/100);};
					
				if (hera>0){
					if (magic[hera]['sat']){
						PhysicalModifiers=PhysicalModifiers*(100+magic[hera]['sat']['effect'])/100;
					};
				};
			};
				
				if ((!this.obj[attacker]['hero'])&&(isperk(attacker,_PERK_BLESS))){
					PhysicalModifiers*=1.04;
				};

				o = this.obj[attacker]['owner'];
				if (magic[defender]['mf'+o]){
					PhysicalModifiers *= 1 + magic[defender]['mf'+o]['effect']/100;
				};


				if ((!this.obj[attacker]['hero'])&&(isperk(attacker,_PERK_FERVOR))){
					PhysicalModifiers*=1.03;
				};


			if (hera>0){
				var h=hera;
			  
				if ((magic[h]['nut'])&&((plid2==-2)||(ohotnik_set_neutral()))){
					PhysicalModifiers=PhysicalModifiers*(100+magic[h]['nut']['effect'])/100;
				};
			  
				if ((magic[h]['mle'])&&(l<=2)){
					PhysicalModifiers=PhysicalModifiers*(100+magic[h]['mle']['effect'])/100;
				};
				if (magic[attacker]['fbd']){
					PhysicalModifiers=PhysicalModifiers*(100+Math.floor(magic[attacker]['fbd']['effect']/10))/100;
				};

			};


			
			monatt=this.obj[attacker]['attack']+this.obj[attacker]['attackaddon']+this.obj[attacker]['rageattack'];
			
			if ((defender>0)&&(this.obj[attacker]['giantslayer'])&&(this.obj[defender]['big'])) monatt+=4;
				
		   if ((!this.obj[attacker]['undead'])&&(!this.obj[attacker]['hero'])&&(!this.obj[attacker]['perseverance'])){
			  frig2=false;
			  i=attacker;
			  var bigx=this.obj[i]['big'];
			  var bigy=this.obj[i]['big'];
			  if (this.obj[i]['bigx']) bigx=1;
			  if (this.obj[i]['bigy']) bigy=1;
			  xd=this.obj[i]['x'];
			  yd=this.obj[i]['y'];
			  for (var xz=xd-1;xz<=xd+1+bigx;xz++){
				 for (var yz=yd-1;yz<=yd+1+bigy;yz++){
					if ((!frig2)&&(mapobj[yz*defxn+xz]>0)&&(this.obj[mapobj[yz*defxn+xz]]['side']!=this.obj[i]['side'])&&(this.obj[mapobj[yz*defxn+xz]]['festeringaura'])&&(this.obj[mapobj[yz*defxn+xz]]['nownumber']>0)){monatt-=4;frig2=true;};
				 };
			  };
		   };

		   if ((magic[attacker]['bsr'])||(magic[attacker]['rof'])){
			  monatt+=Math.floor((this.obj[attacker]['defence']+this.obj[attacker]['defenceaddon']+this.obj[attacker]['ragedefence'])*this.obj[attacker]['defencemodifier']);
		   };
			if (herd>0){
				h=herd;
				if ((magic[h]['mld'])&&(l<=2)){
					PhysicalModifiers=PhysicalModifiers*(100-magic[h]['mld']['effect'])/100;
				};
				if ((magic[h]['_ia'])&&(!this.obj[attacker]['perseverance'])){
						monatt*=(1-magic[h]['_ia']['effect']/100);
				};
				if ((!this.obj[attacker]['hero'])&&(magic[h]['msk'])&&(l>2)){
					PhysicalModifiers=PhysicalModifiers*(100-magic[h]['msk']['effect'])/100;
				};

			};  

			defadd=0;
			if (this.obj[defender]['agility']){
				if (!magic[defender]['agl']) defadd=this.obj[defender]['speed']*2;/*else{
					defadd=magic[defender]['agl']*2;
				};*/
			};
			if ((this.obj[defender]['spirit'])&&(!magic[defender]['spi'])){
				PhysicalModifiers*=0.5;
			};
			if ((this.obj[attacker]['rageagainsttheliving'])&&(this.obj[defender]['alive'])){
				PhysicalModifiers*=1.3;
			};
			if ((this.obj[defender]['defensivestance'])&&(!magic[defender]['mvd'])){
				defadd+=5;
			};

			if (this.obj[defender].packdefence){
					var len = this.obj_array.length;
				 var z = 0;
					for (var k1=0;k1<len;k1++)
					{
						k = this.obj_array[k1];
						if ((k!=defender)&&(this.obj[k].packpower)&&(this.obj[k].nownumber>0)&&(this.obj[k].side==this.obj[defender].side)&&(this.obj[k].x<=defxn)){
							z++;
							if (this.obj[k].packboss) z++;
						};
					};
				 defadd += z*4;
			};   

		   if ((!this.obj[defender]['undead'])&&(!this.obj[defender]['armoured'])&&(!this.obj[defender]['organicarmor'])){
			  frig2=false;
			  i=defender;

			  var bigx=this.obj[i]['big'];
			  var bigy=this.obj[i]['big'];
			  if (this.obj[i]['bigx']) bigx=1;
			  if (this.obj[i]['bigy']) bigy=1;


			  xd=this.obj[i]['x'];
			  yd=this.obj[i]['y'];
			  for (var xz=xd-1;xz<=xd+1+bigx;xz++){
				 for (var yz=yd-1;yz<=yd+1+bigy;yz++){
					if ((!frig2)&&(mapobj[yz*defxn+xz]>0)&&(this.obj[mapobj[yz*defxn+xz]]['side']!=this.obj[i]['side'])&&(this.obj[mapobj[yz*defxn+xz]]['festeringaura'])&&(this.obj[mapobj[yz*defxn+xz]]['nownumber']>0)){defadd-=4;frig2=true;};
				 };
			  };
		   };

			if ((attacker>0)&&(this.obj[defender]['giantslayer'])&&(this.obj[attacker]['big'])) defadd+=4;

			mondef=Math.round((this.obj[defender]['defence']+this.obj[defender]['defenceaddon']+defadd+this.obj[defender]['ragedefence'])*this.obj[defender]['defencemodifier']);

			
			if (magic[defender]['bsr']){
			   mondef=0;
			};
			if ((this.obj[attacker]['preciseshot'])&&(l>2)&&(l<=9)&&(rangemod>=1)){mondef=0;};
			if ((this.obj[attacker]['ignoredefence'])){mondef*=(1-this.obj[attacker]['ignoredefence']/100);};

			
			if (this.obj[attacker]['crushingleadership']){
				var morale_delta = this.getmorale(attacker) - this.getmorale(defender);
				if (morale_delta>0){
					mondef *= Math.max(0, 1-morale_delta/10);
				};
			};

			if (this.obj[attacker]['sacredweapon']){
			  var dark_count =get_dark_count(defender);
			  if (dark_count>0){
				 mondef *= Math.max(0, 1 - 0.15*dark_count);
			  };
		   };


			if (isperk(attacker, _PERK_PIERCING_LUCK)) {mondef *= 1 - Math.max(0, 0.025*(this.obj[attacker]['luck']+this.obj[attacker]['luckaddon']));};


			if ((this.obj[defender]['ignoreattack'])){monatt*=(1-this.obj[defender]['ignoreattack']/100);};
			if ((this.obj[attacker]['ridercharge'])&&(movelen>0)){
				mondef=mondef*(5-movelen)/5;
			};
			if ((this.obj[attacker]['forcearrow'])&&(!this.obj[defender]['armoured'])&&(!this.obj[defender]['organicarmor'])&&(l>2)){
				mondef*=0.8;
			};

			if ((this.obj[attacker]['armorpiercing'])&&(!this.obj[defender]['armoured'])&&(!this.obj[defender]['organicarmor'])&&(l>2)){
				mondef*=0.5;
			};


			if (this.obj[defender]['shroudofdarkness']){
				PhysicalModifiers *= Math.max(0, 1 - 0.15*get_dark_count(defender));
			};

		   if (this.obj[attacker]['tasteofdarkness']){
			  PhysicalModifiers *= 1 + get_dark_count(defender)*0.12;
		   };


			if ((this.obj[attacker]['jousting'])&&(movelen>0)){
				PhysicalModifiers=PhysicalModifiers*(1+0.05*movelen);
			};
			if (((this.obj[attacker]['blindingcharge'])||(this.obj[attacker]['charge']))&&(movelen>0)){
				PhysicalModifiers=PhysicalModifiers*(1+0.1*movelen);
			};
			if ((this.obj[defender]['shieldwall'])&&(movelen>0)){
				PhysicalModifiers=PhysicalModifiers*Math.max(0.1,1-0.1*movelen);
			};
			if ((magic[defender]['enc'])&&(magic[defender]['enc']['effect']==1)){
				PhysicalModifiers *= 0.5;
			};	
			if ((this.obj[attacker]['safeposition'])&&(movelen==0)){
				PhysicalModifiers *= 1.5;
			};
			if ((this.obj[attacker]['agilesteed'])&&(movelen>0)){
				PhysicalModifiers *= 1 - 0.05*movelen;
			};
			

			if (mondef<0){mondef=0;};

			air=0;fire=0;water=0;earth=0;
				if ((hera>0)&&(!this.obj[attacker]['taran'])){
					h=hera;
					if (magic[h]['_id']){
						mondef*=(1-magic[h]['_id']['effect']/100);
					};
					if (magic[h]['_aa']){
						air=magic[h]['_aa']['effect']/100;
					};
					if (magic[h]['_af']){
						fire=magic[h]['_af']['effect']/100;
					};
					if (magic[h]['_aw']){
						water=magic[h]['_aw']['effect']/100;
					};
					if (magic[h]['_ae']){
						earth=magic[h]['_ae']['effect']/100;
					};
				};


		   if ((this.obj[defender]['armoured'])||(this.obj[defender]['organicarmor'])){
			  mondef=Math.round((this.obj[defender]['defence']+this.obj[defender]['defenceaddon']+this.obj[defender]['ragedefence'])*this.obj[defender]['defencemodifier']);
		   };
		   if (monatt<0){monatt=0;};
			if (monatt>mondef)
			{AttackDefenseModifier = 1+(monatt-mondef)*0.05;}else
			{AttackDefenseModifier = 1/(1+(mondef-monatt)*0.05);};
			if (this.obj[attacker]['hero']){AttackDefenseModifier=1;};

		var _PERK_ATTACK1=8;
		var _PERK_ATTACK2=9;
		var _PERK_ATTACK3=10;
		var _PERK_DEFENSE1=19;
		var _PERK_DEFENSE2=20;
		var _PERK_DEFENSE3=21;

			if ((!this.obj[attacker]['hero'])&&(l<=2)){
				if (isperk(attacker,_PERK_ATTACK3)) {PhysicalModifiers*=1.3;} else{
					if (isperk(attacker,_PERK_ATTACK2)) {PhysicalModifiers*=1.2;} else 
						if (isperk(attacker,_PERK_ATTACK1)) PhysicalModifiers*=1.1;
				};

				if (isperk(defender,_PERK_DEFENSE3)) {PhysicalModifiers*=0.7;}else{
					if (isperk(defender,_PERK_DEFENSE2)) {PhysicalModifiers*=0.8;}else{
						if (isperk(defender,_PERK_DEFENSE1)) PhysicalModifiers*=0.9;
					};
				};
			};

			
		   if ((this.obj[attacker]['siegewalls'])&&(this.obj[defender]['stone'])){PhysicalModifiers*=10;};

		   var _PERK_COLD_STEEL=14;
		   var _PERK_FIERY_WRATH=101;
		   var _PERK_HELLFIRE_AURA=123;
		   var _PERK_RETRIBUTION=16;

			if (isperk(attacker,_PERK_COLD_STEEL)) water=1-(1-water)*(0.9);
			if (isperk(attacker,_PERK_FIERY_WRATH)) fire=1-(1-fire)*(0.85);
			if (isperk(attacker,_PERK_HELLFIRE_AURA)) fire=1-(1-fire)*(0.95);

			if (magic[attacker]['cre']){
				air=1-(1-air)*(1-magic[attacker]['cre']['effect']/100);
			};
			if (isperk(attacker,_PERK_RETRIBUTION)) PhysicalModifiers*=(1+Math.min(Math.max(this.getmorale(attacker, x, y),0),5)/20);
			
			if ((this.obj[attacker]['viciousstrike'])&&(Math.max(0, Math.round((this.obj[defender]['speed']+this.obj[defender]['ragespeed']+this.obj[defender]['speedaddon'])*this.obj[defender]['speedmodifier']))==0)) PhysicalModifiers*=1.5;
			PhysicalModifiers*=this.magicmod(attacker,defender,fire,air,water,earth, 0.1);
			if ((this.obj[attacker]['bloodfrenzy'])&&(magic[defender]['fd1'])){
				PhysicalModifiers*=1.3;
			};

			UmelkaModifiers=1;
			if ((umelka[this.obj[attacker]['owner']][0]>0)&&(umelka[this.obj[defender]['owner']][0]>0)){
				k=umelka[this.obj[attacker]['owner']][0];
				if ((k>0)&&(k<11)){
					j=umelka[this.obj[defender]['owner']][k];
					UmelkaModifiers = 1 - j*0.03;
				};
			};

			NumCreatures=this.obj[attacker]['nownumber'];

				tsc=0;
			  var bigx=this.obj[defender]['big'];
			  var bigy=this.obj[defender]['big'];
			  if (this.obj[defender]['bigx']) bigx=1;
			  if (this.obj[defender]['bigy']) bigy=1;
			  
					for (var xs=this.obj[defender]['x']-1;xs<=this.obj[defender]['x']+1+bigx;xs++){
						for (var ys=this.obj[defender]['y']-1;ys<=this.obj[defender]['y']+1+bigy;ys++){
							if ((mapobj[xs+ys*defxn]>0)&&(mapobj[xs+ys*defxn]!=defender)&&(this.obj[mapobj[xs+ys*defxn]]['shieldguard'])&&(this.obj[defender]['side']==this.obj[mapobj[xs+ys*defxn]]['side'])){
								tsc++;
							};
						};
					};
					PhysicalModifiers/=(tsc+1);
			  var minmag = 0;
			  var maxmag = 0;
			  if ((inuse=='lep')&&(this.obj[attacker]['crashingleap'])){
				  Totalmagicdamage = 0;
				  this.obj[defender]['attacked'] = 1;
				  this.attackmagic(attacker, defender, this.obj[attacker]['nownumber']*4, 'cold', '', 0, 0, 0);
				  minmag = Totalmagicdamage;
				  Totalmagicdamage = 0;
				  this.obj[defender]['attacked'] = 1;
				  this.attackmagic(attacker, defender, this.obj[attacker]['nownumber']*6, 'cold', '', 0, 0, 0);
				  maxmag = Totalmagicdamage;
			  };

			   mindam=this.obj[attacker]['mindam']+this.obj[attacker]['damageaddon']+(this.obj[attacker]['maxdam']-this.obj[attacker]['mindam'])*(this.obj[attacker]['mindamaddon'])+this.obj[attacker]['ragedamage'];
			   maxdam=this.obj[attacker]['maxdam']+this.obj[attacker]['damageaddon']-(this.obj[attacker]['maxdam']-this.obj[attacker]['mindam'])*(this.obj[attacker]['maxdamaddon'])+this.obj[attacker]['ragedamage'];

			   h = hera;
			   if ((h>0)&&(magic[h])&&(magic[h]['BLS'])&&(magic[h]['BLS']['effect']>0)) mindam = maxdam;
			   if ((h>0)&&(magic[h])&&(magic[h]['CRS'])&&(magic[h]['CRS']['effect']>0)) maxdam = mindam;


			   if ((this.obj[attacker]['taran'])&&(this.obj[defender]['stone'])){
				  h=hera;
				  mindam=Math.floor(Math.pow(this.obj[h]['maxhealth'],0.5)*200*this.obj[attacker]['mindam']);
				  maxdam=Math.floor(Math.pow(this.obj[h]['maxhealth'],0.5)*400*this.obj[attacker]['maxdam']);
			   };
			   if (this.obj[attacker]['accuracy']) mindam=maxdam;
			BaseDamage=mindam;

			PhysicalDamage = NumCreatures * BaseDamage * AttackDefenseModifier * PhysicalModifiers * UmelkaModifiers + minmag;
			PhysicalDamage2 = NumCreatures * maxdam * AttackDefenseModifier * PhysicalModifiers * UmelkaModifiers + maxmag;

		   if ((this.obj[attacker]['deathstrike'])&&(this.obj[defender]['maxhealth']<400)&&(!this.obj[defender]['stone'])){
			  if ((this.obj[defender]['nownumber']-1)*this.obj[defender]['maxhealth']+this.obj[defender]['nowhealth']>PhysicalDamage){
				 PhysicalDamage+=this.obj[defender]['maxhealth']-PhysicalDamage%this.obj[defender]['maxhealth'];
			  };
			  if ((this.obj[defender]['nownumber']-1)*this.obj[defender]['maxhealth']+this.obj[defender]['nowhealth']>PhysicalDamage2){
				 PhysicalDamage2+=this.obj[defender]['maxhealth']-PhysicalDamage2%this.obj[defender]['maxhealth'];
			  };
		   };
		   if (this.obj[attacker]['bladeofslaughter']){
				 PhysicalDamage+=Math.min(500, this.obj[defender]['nownumber']*2);
				 PhysicalDamage2+=Math.min(500, this.obj[defender]['nownumber']*2);
		   };
		   if (magic[attacker]['brk']){
				 PhysicalDamage*=(1+magic[attacker]['brk']['effect']*0.03);
				 PhysicalDamage2*=(1+magic[attacker]['brk']['effect']*0.03);
		   };

			if (PhysicalDamage<1){PhysicalDamage=1;};
			if (PhysicalDamage2<1){PhysicalDamage2=1;};

			if ((this.obj[attacker]['magicattack'])&&(l>2)&&(this.issomething(defender, 'dampenmagic'))) PhysicalDamage=0;

		   if (magic[defender]['rag']){
			   PhysicalDamage=this.ragedamage(defender, PhysicalDamage);
			   PhysicalDamage2=this.ragedamage(defender, PhysicalDamage2);
		   };

		   if ((this.obj[attacker]['vorpalsword'])&&(this.obj[defender]['maxhealth']<400)&&(!this.obj[defender]['stone'])){
				 PhysicalDamage+=this.obj[defender]['maxhealth'];
				 PhysicalDamage2+=this.obj[defender]['maxhealth'];
		   };
		   
		   
		   PhysicalDamage=Math.round(PhysicalDamage);
		   PhysicalDamage2=Math.round(PhysicalDamage2);
		   if (this.obj[defender]['pleasureinpain']) {
			   PhysicalDamage=Math.round(PhysicalDamage*0.9);
			   PhysicalDamage2=Math.round(PhysicalDamage2*0.9);
		   };
		   if (this.obj[defender]['raptureinagony']) {
			   PhysicalDamage=Math.round(PhysicalDamage*0.8);
			   PhysicalDamage2=Math.round(PhysicalDamage2*0.8);
		   };
		   var totalh=(this.obj[defender]['nownumber']-1)*this.obj[defender]['maxhealth']+this.obj[defender]['nowhealth'];
		   Uronkills= Math.floor(Math.min(PhysicalDamage,  totalh)/this.obj[defender]['maxhealth']);
		   Uronkills2=Math.floor(Math.min(PhysicalDamage2, totalh)/this.obj[defender]['maxhealth']);
		   var nowhealth=this.obj[defender]['nowhealth']-(Math.min(PhysicalDamage,  totalh)-Uronkills*this.obj[defender]['maxhealth']);
		   var nowhealth2=this.obj[defender]['nowhealth']-(Math.min(PhysicalDamage2,  totalh)-Uronkills2*this.obj[defender]['maxhealth']);
		   if (nowhealth<=0) Uronkills++;
		   if (nowhealth2<=0) Uronkills2++;

		   tUronkills+=Uronkills;
		   tUronkills2+=Uronkills2;
		   tPhysicalDamage+=PhysicalDamage;
		   tPhysicalDamage2+=PhysicalDamage2;

		}

	}
}