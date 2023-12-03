const inputs = {
	nameInput: document.querySelector('[name="full-name"]'),
	emailInput: document.querySelector('[name="email"]'),
	phoneInput: document.querySelector('[name="tel"]'),
	serviceSelect: document.querySelector('[name="service"]'),
	rateSelect: document.querySelector('[name="rate"]'),
	rentSelect: document.querySelector('[name="rent"]'),
}
let SERVICES
const store = {
	service: null,
	rate_id: null,
	rents: null,
	rent_id: null
}
const activeInputs = new Set([inputs.nameInput, inputs.emailInput, inputs.phoneInput, inputs.serviceSelect])

fetch('get-services.php', {
	method: 'post',

}).then(res => res.json())
	.then(data => {
		SERVICES = data
		data.forEach(service => {
			inputs.serviceSelect.insertAdjacentHTML('beforeend', `
			<option value="${service.id}">${service.title}</option>
			`)
		})
	})

inputs.serviceSelect.addEventListener('change', function (evt) {
	const target = evt.target
	store.service = SERVICES.filter(s => s.id === target.value)[0]
	const hasRates = store.service.rates !== null ? true : false
	if (hasRates) {
		setSelectDisplay(inputs.rateSelect, true)
		insertOptions(inputs.rateSelect, store.service.rates)

		setSelectDisplay(inputs.rentSelect, false)
	}
	else {
		setSelectDisplay(inputs.rateSelect, false)

		setSelectDisplay(inputs.rentSelect, true)
		store.rents = store.service.rents
		insertOptions(inputs.rentSelect, store.rents)
	}
	updateSum(0)
	formIsValid()
})
inputs.rateSelect.addEventListener('change', function (evt) {
	const target = evt.target
	store.rate_id = target.value !== '' ? target.value : null
	store.rents = store.service.rents.filter(r => r.rate_id === store.rate_id)
	const hasRates = store.rents[0].price !== null ? true : false
	if (hasRates) {
		setSelectDisplay(inputs.rentSelect, true)
		insertOptions(inputs.rentSelect, store.rents)
	} else {
		setSelectDisplay(inputs.rentSelect, false)
	}
	updateSum(0)
	formIsValid()
})
inputs.rentSelect.addEventListener('change', function (evt) {
	const target = evt.target
	store.rent_id = target.value
	const sum = store.rents.filter(r => r.id === target.value)[0].price
	updateSum(sum)
	formIsValid()
})

const submitBtn = document.querySelector('.pay__submit-btn')
submitBtn.addEventListener('click', function () {

	for (const input of activeInputs) {
		if (!input.reportValidity()) {
			return
		}
	}
	const order = {
		name: inputs.nameInput.value.trim(),
		email: inputs.emailInput.value.trim(),
		phone: inputs.phoneInput.value,
		service_id: inputs.serviceSelect.value,
		rate_id: inputs.rateSelect.value !== '' ? inputs.rateSelect.value : null,
		rent_id: inputs.rentSelect.value !== '' ? inputs.rentSelect.value : null
	}

	fetch('pay-submit.php', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(order)
	}).then(res => res.json())
		.then(data => {
			console.log(data);
			if (!data.error) {
				const successLabel = document.querySelector('.pay__success-label')
				submitBtn.classList.add('dn')
				successLabel.classList.remove('dn')
			}
		})
})

const allInputs = document.querySelectorAll('input')

allInputs.forEach(input => {
	input.addEventListener('input', formIsValid)
})

const phone_inputs = document.querySelectorAll('input[type="tel"');
for (const phone of phone_inputs) {
	for (let ev of ['input', 'blur', 'focus']) {
		phone.addEventListener(ev, function (e) {
			var target = e.target,
				matrix = "+7(___) ___-__-__",
				i = 0,
				def = matrix.replace(/\D/g, ""),
				val = target.value.replace(/\D/g, "");


			if (e.type === 'blur') {
				if (val.length < matrix.match(/([\_\d])/g).length) {
					target.setCustomValidity('Не соответствие формату')
				} else {
					target.setCustomValidity('')
				}

				return;
			}
			if (def.length >= val.length) val = def;
			target.value = matrix.replace(/./g, function (a) {
				return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
			});

		});
	}
}

const selects = document.querySelectorAll('select')
for (const select of selects) {
	select.setCustomValidity('Выберете значение')
	select.addEventListener('change', function () {
		formIsValid()
		console.log(select.value);
		if (select.value !== '') {
			select.setCustomValidity('')
		} else {
			select.setCustomValidity('Выберете значение')
		}
	})
}

function formIsValid() {
	window.requestAnimationFrame(() => {
		for (const input of activeInputs) {
			console.log(input);
			if (!input.checkValidity()) {
				console.log('empty', input);
				submitBtn.classList.add('disabled')
				return false
			}
		}
		submitBtn.classList.remove('disabled')
		return true
	})
}

function setSelectDisplay(select, state) {
	if (state) {
		select.closest('.input-wrapper').classList.add('active')
		activeInputs.add(select)
		select.setCustomValidity('Выберете значение')
	} else {
		select.closest('.input-wrapper').classList.remove('active')
		if (activeInputs.has(select)) {
			activeInputs.delete(select)
		}
	}
}
function insertOptions(select, data) {
	const hintOption = select.firstElementChild.cloneNode(true)
	select.innerHTML = ``
	select.insertAdjacentElement('beforeend', hintOption)
	data.forEach(rate => {
		select.insertAdjacentHTML('beforeend', `
			<option value="${rate.id}">${rate.title}</option>
			`)
	})
}
function updateSum(sum) {
	document.querySelector('.pay__count span').textContent = sum
}