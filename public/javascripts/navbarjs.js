

$(document).ready(function () {
	"use strict";

	var menuActive = false;
	var header = $('.header');
	setHeader();
	initCustomDropdown();
	initPageMenu();

	function setHeader() {

		if (window.innerWidth > 991 && menuActive) {
			closeMenu();
		}
	}

	function initCustomDropdown() {
		if ($('.custom_dropdown_placeholder').length && $('.custom_list').length) {
			var placeholder = $('.custom_dropdown_placeholder');
			var list = $('.custom_list');
		}

		placeholder.on('click', function (ev) {
			if (list.hasClass('active')) {
				list.removeClass('active');
			}
			else {
				list.addClass('active');
			}

			$(document).one('click', function closeForm(e) {
				if ($(e.target).hasClass('clc')) {
					$(document).one('click', closeForm);
				}
				else {
					list.removeClass('active');
				}
			});

		});

		$('.custom_list a').on('click', function (ev) {
			ev.preventDefault();
			var index = $(this).parent().index();

			placeholder.text($(this).text()).css('opacity', '1');

			if (list.hasClass('active')) {
				list.removeClass('active');
			}
			else {
				list.addClass('active');
			}
		});


		$('select').on('change', function (e) {
			placeholder.text(this.value);

			$(this).animate({ width: placeholder.width() + 'px' });
		});
	}

	/* 
	
	4. Init Page Menu
	
	*/

	function initPageMenu() {
		if ($('.page_menu').length && $('.page_menu_content').length) {
			var menu = $('.page_menu');
			var menuContent = $('.page_menu_content');
			var menuTrigger = $('.menu_trigger');

			//Open / close page menu
			menuTrigger.on('click', function () {
				if (!menuActive) {
					openMenu();
				}
				else {
					closeMenu();
				}
			});

			//Handle page menu
			if ($('.page_menu_item').length) {
				var items = $('.page_menu_item');
				items.each(function () {
					var item = $(this);
					if (item.hasClass("has-children")) {
						item.on('click', function (evt) {
							evt.preventDefault();
							evt.stopPropagation();
							var subItem = item.find('> ul');
							if (subItem.hasClass('active')) {
								subItem.toggleClass('active');
								TweenMax.to(subItem, 0.3, { height: 0 });
							}
							else {
								subItem.toggleClass('active');
								TweenMax.set(subItem, { height: "auto" });
								TweenMax.from(subItem, 0.3, { height: 0 });
							}
						});
					}
				});
			}
		}
	}

	function openMenu() {
		var menu = $('.page_menu');
		var menuContent = $('.page_menu_content');
		TweenMax.set(menuContent, { height: "auto" });
		TweenMax.from(menuContent, 0.3, { height: 0 });
		menuActive = true;
	}

	function closeMenu() {
		var menu = $('.page_menu');
		var menuContent = $('.page_menu_content');
		TweenMax.to(menuContent, 0.3, { height: 0 });
		menuActive = false;
	}


});


document.addEventListener('DOMContentLoaded', count)
document.addEventListener('DOMContentLoaded', wishCount)


function count() {

	var xhr = new XMLHttpRequest();
	var url = '/cart-count/';
	xhr.open("GET", url, true);


	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(this.responseText)
			document.getElementById('cart-count-sm').innerHTML = data.count
			document.getElementById('cart-count-lg').innerHTML = data.count
		}
	}

	xhr.send();
}


function wishCount() {

	var xhr = new XMLHttpRequest();
	var url = '/wish-count/';
	xhr.open("GET", url, true);


	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(this.responseText)
			document.getElementById('wishCount-h').innerHTML = data.wishcount
		}
	}

	xhr.send();
}

//add to cart




function addToCart(id) {
	var xhr = new XMLHttpRequest();


	var url = '/add-to-cart/' + id;
	xhr.open("GET", url, true);

	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(this.responseText)


			if (data.response.duplicate) {
				swal({
					title: 'Item already in th cart',
					text: 'try adding some other books',
					icon: 'warning',
					timer: 1000,
					buttons: false,
				})
			} else if (data.response.limitExceed) {
				console.log("your limit exceeds")
				swal({
					title: 'your limit exceeds',
					text: '',
					icon: 'warning',
					timer: 1000,
					buttons: false,
				})
			}
			else if (data.response.holding) {
				swal({
					title: 'you already holding this book ',
					text: 'or ordered this book',
					icon: 'warning',
					timer: 1000,
					buttons: false,
				})
			}
			else {
				swal({
					title: 'succesfully adedd to cart',
					text: '😊',
					icon: 'success',
					timer: 1000,
					buttons: false,
				})
			}
			count()
		}

	}

	xhr.send();
}

function myfunction(id) {

	axios.get(`/isInWishlist/${id}`).then((data) => {
		if (data.data.response) {
			document.getElementById("wish" + id).className = "bi bi-heart-fill";
			document.getElementById("wish" + id + "HotRental").className = "bi bi-heart-fill";
			document.getElementById("wish" + id + "JustAddedd").className = "bi bi-heart-fill";
		} else {
			document.getElementById("wish" + id).className = "bi bi-heart";
			document.getElementById("wish" + id + "HotRental").className = "bi bi-heart";
			document.getElementById("wish" + id + "JustAddedd").className = "bi bi-heart";
		}
	})

}


function wish(id) {

	axios.get('/wishlist/' + id).then((response) => {
		if (response.status == 200) {
			if (response.data.response) {

				document.getElementById("wish" + id).className = "bi bi-heart-fill";
				document.getElementById("wish" + id + "HotRental").className = "bi bi-heart-fill";
				document.getElementById("wish" + id + "JustAddedd").className = "bi bi-heart-fill";

			} else {
				document.getElementById("wish" + id).className = "bi bi-heart";
				document.getElementById("wish" + id + "HotRental").className = "bi bi-heart";
				document.getElementById("wish" + id + "JustAddedd").className = "bi bi-heart";

			}
			wishCount()
			

		}
	})
}

function remove(id) {
	document.getElementById('remove' + id).style.display = "none";

	wishCount()
	setTimeout(() => {
		wishCount()
	}, 100);
}

function hidesection1() {
	document.getElementById('section1').style.display = 'none';
	document.getElementById('section2').style.marginTop = '10rem';
}
