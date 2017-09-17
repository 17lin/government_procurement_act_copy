var currentIndex = 0, qa = [], total = 0,rand = 0;
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
	$(function() {
          $.getJSON('qa.json', {}, function(r) {
            qa = r;
            total = qa.length;
            showQuiz();
          });
          $('.qa-previous').click(function() {
            currentIndex -= 1;
            if(currentIndex < 0) {
              currentIndex = total - 1;
            }
            showQuiz();
            return false;
          });
		  $('.qa-rand').click(function() {
            currentIndex = Math.floor(Math.random() * (total - 0 + 1)) + 0 ;
            showQuiz();
            return false;
          });
          $('.qa-next').click(function() {
            currentIndex += 1;
            if(currentIndex >= total) {
              currentIndex = 0;
            }
            showQuiz();
            return false;
          });
          $('.qa-jump').click(function() {
            currentIndex = window.prompt('輸入 1-' + total + ' 數字');
            currentIndex = parseInt(currentIndex) - 1;
            showQuiz();
            return false;
          });
        })
		function showQuiz() {
          $('#qa-result').html('');
          $('#qa-quiz').html(qa[currentIndex].quiz);
          var answers = '';
          for(k in qa[currentIndex].options) {
            if(qa[currentIndex].answer == k) {
              answers += '<label class="radio-inline" style="color: #e35a54;"><input name="answer" class="qa-options" type="radio" value="' + k + '" />' + ' &nbsp; ' + qa[currentIndex].options[k] + '</label><br />';
            } else {
              answers += '<label class="radio-inline"><input name="answer" class="qa-options" type="radio" value="' + k + '" />' + ' &nbsp; ' + qa[currentIndex].options[k] + '</label><br />';
            }
          }
          $('#qa-answer').html(answers);
          $('input.qa-options').change(function() {
            $('.qa-next').trigger('click');
          });
          $('div#qa-status').html('第 ' + (currentIndex + 1) + ' 題 / 共 ' + total + ' 題');
        }
});			
