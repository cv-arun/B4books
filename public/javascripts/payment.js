
function payment(jsonString) {
    let order = JSON.parse(jsonString)

    var options = {
        "key": "rzp_test_Zm4jovmYwfus4h", // Enter the Key ID generated from the Dashboard
        "amount": `${order.amount}`, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Acme Corp",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {

            // {

            //     alert(response.razorpay_payment_id);
            //     alert(response.razorpay_order_id);
            //     alert(response.razorpay_signature)

            // }
            checkPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
        {
            swal("Payment failed", "Try again", "error").then(() => {
                location.href = '/membership'
            })
            // alert(response.error.code);
            // alert(response.error.description);
            // alert(response.error.source);
            // alert(response.error.step);
            // alert(response.error.reason);
            // alert(response.error.metadata.order_id);
            // alert(response.error.metadata.payment_id);
        }
    });
    document.getElementById('rzp-button1').onclick = function (e) {
        rzp1.open();
        e.preventDefault();
    }




}

function checkPayment(response, order) {
    axios.post('/checkPayment', {
        response: response,
        order: order
    }).then((response) => {
        console.log(response)
        if (response.data.response.signatureIsValid) {
            swal("Payment success", "everithing fine you can go back to home", "success").then(() => {
                location.href = '/'
            })

        } else {
            swal("Payment failed", "Try again", "error").then(() => {
                location.href = '/membership'
            })
        }
    })
}




