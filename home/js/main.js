/* main function to invoke main visualization view
 * author: Mai Elshehaly
 * Date: 18/09/2018
 */  
(function($Q){
	$Q.mainControl = new $Q.Control();
	window.onbeforeunload = function() {
		$Q.mainControl.writeSessionLog();
		console.log("BYE");
    return "Saving session log. Bye!";
	};
	 
})(QUALDASH);