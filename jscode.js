var currentIndex = 0, qa = [], total = 0,count = 0;
function init() {
	$('#qa-result').html('');
	$('#qa-quiz').html(qa[currentIndex].quiz);
	var answers = '';
	for(k in qa[currentIndex].options) {					
		answers += '<label class="radio-inline"><input name="answer" class="qa-options" type="radio" value="' + k + '" />' + ' &nbsp; ' + qa[currentIndex].options[k] + '</label><br />';
	}
	$('#qa-answer').html(answers);
	$('input.qa-options').change(function() {
		var selected = $(this).val();					
		if(selected == qa[currentIndex].answer) {
			$('#qa-result').html("答對惹！");
		} else {
			$('#qa-result').html("答錯惹！答案是 -> " + qa[currentIndex].options[qa[currentIndex].answer]);
		}
	});	
	$('div#qa-status').html('第 ' + (currentIndex + 1) + ' 題 / 共 ' + total + ' 題' + '   本次練習共累計' + count + '題');
	count++;
}
$(document).ready(function(){
	$("#flip").click(function(){
		$("#panel").slideToggle("fast");
	});
	$("#flip_table").click(function(){
		$("#panel_table").slideToggle("slow");
	});
	$("#close_table").click(function(){
		$("#panel_table").slideToggle("slow");
	});
	$.getJSON('qa.json', {}, function(r) {
		qa = r;
		total = qa.length;
		init();
	});
	$('.qa-previous').click(function() {
		currentIndex -= 1;
		if(currentIndex < 0) {
			currentIndex = total - 1;
		}
		init();
		return false;//止默認行為和阻止冒泡
	});
	$('.qa-rand').click(function() {
            currentIndex = Math.floor(Math.random() * (total - 0 + 1)) + 0 ;
            init();
            return false;
          });
	$('.qa-next').click(function() {
		currentIndex += 1;
		if(currentIndex >= total) {
			currentIndex = 0;
		}
		init();
		return false;
	});
	$('.qa-jump').click(function() {
		currentIndex = window.prompt('輸入 1-' + total + ' 數字');
		currentIndex = parseInt(currentIndex) - 1;
		init();
		return false;
	});
});			
