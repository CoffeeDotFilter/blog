tinymce.init({
  selector: '#tiny',
  height: 300,
  theme: 'modern',
  plugins: [
    'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools'
  ],
  toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
  toolbar2: 'print preview media | forecolor backcolor emoticons',
  image_advtab: true,
  templates: [
    { title: 'Test template 1', content: 'Test 1' },
    { title: 'Test template 2', content: 'Test 2' }
  ],
  content_css: [
    '//fast.fonts.net/cssapi/e6dc9b99-64fe-4292-ad98-6974f93cd2a2.css',
    '//www.tinymce.com/css/codepen.min.css'
  ]
 });

(function() {
		// Save date in date div, and display it in readable format
		var date = Date.now();
    console.log(typeof date);
		document.getElementById('date').value = date;
		var display = document.getElementById('display');
		display.innerHTML = '<b>Date:</b> ' + new Date(date).toString().substr(0, 15);

		// Display author's name in display div, capitalised
		var author = document.getElementById('author');
		display.innerHTML += ' <br><b>Author:</b> '
											+ author.value.substr(0,1).toUpperCase()
											+ author.value.substr(1);

})();
