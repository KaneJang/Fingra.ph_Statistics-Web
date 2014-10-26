var data_array,figures,channelMinDate,channelMaxDate;

$(function() {
	period = $("#period").msDropdown({
		roundedCorner:true,
		on:{change: function(data, ui){addPeriods(data.value);}}
	}).data("dd").set('disabled',true);

	term = $("#term").msDropdown({
		roundedCorner:true,
		on:{change: function(data, ui){getFingraphData();}}
		}).data("dd");
	//segment setting
	segment = $("#segment").msDropdown({
		on:{change: function(data, ui){displayLineChart(figures,data_array);}}
			}).data("dd");
});

function settingFromTo(fromDate,toDate){
	channelMinDate=fromDate;
	channelMaxDate=toDate;
	$('#from, #to').datepick({
		renderer: $.datepick.themeRollerRenderer,
	    showTrigger: '#calImg',
    	firstDay:1,	//달력 월요일부터 시작
		dateFormat:'yyyy-mm-dd',
		minDate: fromDate,//fingraph 시작일
		maxDate: toDate,//오늘
		showOnFocus: false,//text클릭 안되게
		onSelect: customRange,
		onClose: function() {
			getFingraphData();
			 }
	  });

	var to;
	if(moment().isSame(toDate)){
		to = moment().subtract('days', 1).format('YYYY-MM-DD');
	}else if(moment().isBefore(toDate)){
		to = moment().subtract('days', 1).format('YYYY-MM-DD');
	}else{
		to = moment(toDate).format('YYYY-MM-DD');
	}
	var from = fromDate;

	$('#fromTo').val(from +' ~ '+to);
	$('#from').val(from);
	$('#to').val(to);

	//달력의 from to 기간체크세팅
	$('#to').datepick('option', 'minDate', fromDate || null);
	$('#from').datepick('option', 'maxDate', toDate || null);
	$('#periodNext').attr('src',$('#periodNext').attr('src').replace('_active','_inactive')).removeClass('hand').attr('title','');
	$('#periodPrev').attr('src',$('#periodPrev').attr('src').replace('_active','_inactive')).removeClass('hand').attr('title','');
}

//달력과 연동되는 from to 기간체크세팅
function customRange(dates) {
    if (this.id == 'from') {
        $('#to').datepick('option', 'minDate', channelMinDate || null);
    }
    else {
        $('#from').datepick('option', 'maxDate', channelMaxDate || null);
    }
    $('#fromTo').val($('#from').val() +' ~ '+$('#to').val());
}

//누적 데이터 생성하여 데이터 저장
//linechart, excel사용
function dataTranslation(data){
	figures = data.figures;
	var result = data.list;

	data_array = new Array(result.length);//배열초기화
	var term = $('#term').val();
	var excel_date='';
	var chart_date='';
	var cumulative =0;
	for(var i = 0;i<result.length;i++) {
		if(term == 'daily'){
			excel_date = result[i].date;
			chart_date = moment(result[i].date).format('MMM D, YYYY'); // x
		}else if(term=='weekly'){
			excel_date = result[i].fromDate + ' ~ ' + result[i].toDate;
			chart_date = moment(result[i].fromDate).format('MMM D, YYYY') + ' ~ ' + moment(result[i].toDate).format('MMM D, YYYY');
		}else if(term=='monthly'){
			excel_date = result[i].year + '-' + result[i].month;
			chart_date = moment(result[i].year + '-' + result[i].month).format('MMM, YYYY');
		}
		cumulative += result[i].value;
		data_array[i]={date:chart_date,excel_date:excel_date,value:result[i].value,cumulative:cumulative};
	}

}

//날짜 이동 함수
function movePriedRange(target){
	//사용자정의세팅
	period.setIndexByValue('c-u');
	var from = moment($('#from').val());
	var to = moment($('#to').val());
	var periodDiffDays =  to.diff(from,'days')+1;
	var moveFrom;
	var moveTo;
	if(target == 'prev'){
		moveFrom = from.subtract('days', periodDiffDays).format('YYYY-MM-DD');
		moveTo = to.subtract('days', periodDiffDays).format('YYYY-MM-DD');
	}else{
		moveFrom = from.add('days', periodDiffDays).format('YYYY-MM-DD');
		moveTo = to.add('days', periodDiffDays).format('YYYY-MM-DD');
	}

	$('#fromTo').val(moveFrom +' ~ '+moveTo);
	$('#from').val(moveFrom);
	$('#to').val(moveTo);

	//달력의 from to 기간체크세팅
	$('#to').datepick('option', 'minDate', moveFrom || null);
	$('#from').datepick('option', 'maxDate', moveTo || null);

	setPeriodCookie(moveFrom,moveTo,$('#period').val());

}

function setPeriodCookie(from,to,period){
	if(period=='c-u'){
		var expire = new Date();
		var fromTo = from + ' ~ ' + to;
	    expire.setDate(expire.getDate() + 5);
	    cookies = 'fingraphPeriod=' + escape(fromTo)+'|'+escape(period) +'; path=/;'; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
	    cookies += ';expires=' + expire.toGMTString() + ';';
	    document.cookie = cookies;
	}else{
		  var expireDate = new Date();
		  //어제 날짜를 쿠키 소멸 날짜로 설정한다.
		  expireDate.setDate( expireDate.getDate() - 1 );
		  document.cookie = "fingraphPeriod= " + "; expires=" + expireDate.toGMTString() + "; path=/";

	}
	//이전, 이후 버튼 세팅 추가 2013-09-27
    setPrevNextBtn($('#from').val(),$('#to').val());
	getFingraphData();
}

function getPeriodCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
         start += cName.length;
         var end = cookieData.indexOf(';', start);
         if(end == -1)end = cookieData.length;
         cValue = cookieData.substring(start, end);
         splitVal = unescape(cValue).split('|');

         $('#fromTo').val(splitVal[0]);
        	var fromTo = splitVal[0].split(' ~ ');
     		$('#from').val(fromTo[0]);
     		$('#to').val(fromTo[1]);
     		period.setIndexByValue(splitVal[1]);
     	//달력의 from to 기간체크세팅
     	$('#to').datepick('option', 'minDate', fromTo[0] || null);
 		//이전, 이후 버튼 세팅 추가 2013-09-27
 	    setPrevNextBtn($('#from').val(),$('#to').val());
        getFingraphData();
    }else{
    	period.setIndexByValue('7-d');
    	addPeriods('7-d');
    }

}
//달력의 prev, next버튼 세팅
function setPrevNextBtn(from,to){
	var minDate = moment('2012-03-01');//fingraph 시작일
	//var maxDate = moment().subtract('d', 1);//어제()
	var maxDate = moment();//오늘(실시간)
	//moment변환
	var mfrom = moment(from);
	var mto = moment(to);
	//from to 의 차
	var periodDiffDays =  mto.diff(mfrom,'days');

	//prev버튼 체크
	if(mfrom.diff(minDate,'days') > periodDiffDays){
		$('#periodPrev').attr('src',$('#periodPrev').attr('src').replace('_inactive','_active')).addClass('hand').attr('title','Previous period');
	}else{
		$('#periodPrev').attr('src',$('#periodPrev').attr('src').replace('_active','_inactive')).removeClass('hand').attr('title','');
	}
	//next버튼 체크
	if(maxDate.diff(to,'days') > periodDiffDays){
		$('#periodNext').attr('src',$('#periodNext').attr('src').replace('_inactive','_active')).addClass('hand').attr('title','Next period');
	}else{
		$('#periodNext').attr('src',$('#periodNext').attr('src').replace('_active','_inactive')).removeClass('hand').attr('title','');
	}
}

//기간별 날짜세팅 (오늘-실시간)
function addPeriods(periodVal){
	var type = periodVal.split('-');
	var to = moment();
	var from = "";
	if(type[1]=='d'){
		from = moment().subtract('d', eval(type[0]-1)).format('YYYY-MM-DD');
	}else if(type[1]=='m'){
		from = moment().subtract('M',eval(type[0])).format('YYYY-MM-DD');
	}else if(type[1]=='y'){
		from = moment().year() + '-01-01';
	}else if(type[1]=='t'){
		from = channelMinDate;
		to = moment(channelMaxDate);
	}else{
		$('.calImg').css('display','');
		return;
	}

	$('#fromTo').val(from +' ~ '+to.format('YYYY-MM-DD'));
	$('#from').val(from);
	$('#to').val(to.format('YYYY-MM-DD'));

	//달력의 from to 기간체크세팅
	$('#to').datepick('option', 'minDate', from || null);
	if (type[1] != 't'){setPeriodCookie($('#fromTo').val(),$('#period').val());}


}

//chart 표시되는 기간계산
function makeSubTitle(term, fromTo){
	//console.log(fromTo);
	var period = fromTo.split(' ~ ');
	var subTitle = '';
	if(period.length == 2){
		if(term == 'daily'){
			subTitle = moment(period[0]).format('MMM D, YYYY') +' ~ '+ moment(period[1]).format('MMM D, YYYY');
		}else if(term=='weekly'){
			subTitle = moment(moment(period[0]).isoWeekday(1)).format('MMM D, YYYY') +' ~ '+ moment(moment(period[1]).isoWeekday(7)).format('MMM D, YYYY');
		}else if(term=='monthly'){
			//subTitle = moment(moment(period[0]).startOf('month')).format('MMM D, YYYY') +' ~ '+ moment(moment(period[1]).endOf('month')).format('MMM D, YYYY');
			if(moment(period[0]).format('MMM, YYYY') == moment(period[1]).format('MMM, YYYY')){
				subTitle = moment(period[0]).format('MMM, YYYY');
			}else{
				subTitle = moment(period[0]).format('MMM, YYYY') +' ~ '+ moment(period[1]).format('MMM, YYYY');
			}
		}
		subTitle = '( '+subTitle+' )';
	}
	return subTitle ;
}

