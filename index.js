//klasa koja sadrzi funkcije za validaciju unosa
class ValidationError {
    static forString(str) {
        if (str != "") {
            return str;
        } else {
            console.log("Morate uneti naziv grupe");
            return
        }
    }
    static positiveNum(x) {
        if (x > 0) {
            return x;
        } else {
            console.log("Broj mora biti veci od nule");
            return
        }
    }
    static forTax(x) {
        if (x > 0 && x < 100) {
            return x;
        } else {
            console.log("Vrednost poreza mora biti u intervalu od 0 do 100");
            return
        }
    }
}

class ProductGroup {
    title
    vat //je u %
    constructor(title, vat) {
        this.title = ValidationError.forString(title);
        this.vat = ValidationError.forTax(parseFloat(vat));
    }
}

class Product {
    barCode
    title
    price //cena BEZ PDV-a
    #group
    //niz svih proizvoda u ponudu
    static nizArtikala = [];
    constructor(barCode, title, price) {
        this.barCode = ValidationError.positiveNum(parseInt(barCode));
        this.title = ValidationError.forString(title);
        this.price = ValidationError.positiveNum(parseFloat(price));
        this.group = {};
        Product.nizArtikala.push(this);
    }
    get group() {
        return this.#group;
    }
    set group(objekat) {
        if (objekat instanceof ProductGroup) {
            this.#group = objekat;
        }
    }
}

class ShoppingCartItem {
    product
    quantity
    constructor(naziv, quantity) {
        //za svaki artikal u korpi dodajemo sve info o tom proizvodu da bude lakse izvaditi podatke pri stampanju racuna
        Product.nizArtikala.forEach(obj => {
            if (obj.title.toLowerCase() == naziv.toLowerCase()) {
                this.product = obj;
            }
        })
        this.quantity = ValidationError.positiveNum(parseFloat(quantity));
    }
    contains(naziv) {
        return this.product.title.toLowerCase() == naziv; // true/false
    }
}

class ShoppingCart {
    constructor() {
        this.items = []; //niz artikala u jednoj korpi
    }
    has(naziv) {//provera da li u korpi ima vec proizvoda sa tim imenom
        return this.items.some(item => item.contains(naziv));
    }
    addShoppingItem(naziv, quantity = 1) {
        //ako je ta vrsta proizvoda vec u korpi
        if (this.has(naziv)) {
            this.items.forEach(el => {
                if (el.contains(naziv)) { //nadji proizvod i samo mu uvecaj kolicinu
                    el.quantity += quantity;
                    console.log(el);
                    console.log(this.items);
                }
            })
        } else { //ako ga nije nasao da je vec u korpi, dodaj ga
            this.items.push(new ShoppingCartItem(naziv, quantity));
            console.log(this.items);
        }
    }
}

// selektovanja za tabelu
const divContainer = document.querySelector('.container');
const table = document.querySelector('table');
const tableBody = document.querySelector('.tbody');

class Checkout {//stampanje racuna
    static printCheck(korpa) { //kao nasa metoda addToDom
        let sumaVAT = 0;
        let total = 0;
        let rowNum = korpa.items.length; //broj potrebnih redova
        for (let i = 0; i < rowNum; i++) { // 0 1 2 3

            //uvela prom da skratim kilometarske izraze
            let art = korpa.items[i];
            let cenaBezV = art.product.price;
            let vatUProc = art.product.group.vat;
            let vatpoKom = (cenaBezV * vatUProc) / 100;
            let cenaSaV = cenaBezV + vatpoKom;

            //pravi jedan red u tabeli
            const row = document.createElement('tr');
            row.classList.add('row_style');
            tableBody.appendChild(row);

            const dataPG = document.createElement('td');
            dataPG.className = 'td_style em';
            dataPG.innerHTML = art.product.group.title;
            const dataProd = document.createElement('td');
            dataProd.className = 'td_style';
            dataProd.innerHTML = art.product.title;

            const dataPrice = document.createElement('td');
            dataPrice.className = 'td_style';
            dataPrice.innerHTML = cenaSaV; //SA PDV-om

            const dataQty = document.createElement('td');
            dataQty.className = 'td_style';
            dataQty.innerHTML = art.quantity;

            const dataVAT = document.createElement('td');
            dataVAT.className = 'td_style';
            dataVAT.innerHTML = art.quantity * vatpoKom; //za unetu kolicinu proizvoda
            sumaVAT += art.quantity * vatpoKom;

            const dataST = document.createElement('td');
            dataST.className = 'td_style green_text';
            // ukupan iznos za unetu kolicinu proizvoda
            dataST.innerHTML = cenaSaV * art.quantity;
            total += cenaSaV * art.quantity;

            row.append(dataPG, dataProd, dataPrice, dataQty, dataVAT, dataST)
        }
       
        const totalP = document.createElement('tr');
        tableBody.append(totalP);

        const label = document.createElement('td');
        label.className = 'align';
        label.innerHTML = `<b>VAT / TOTAL<b>`;
        const final = document.createElement('td');
        final.className = 'green_text align';
        final.innerHTML = `${sumaVAT} / ${total}`;
        totalP.append(label, final);
    }
}


//proizvodima dodaje grupe kojima pripadaju
let mlecniProizvodi = new ProductGroup("Mlecni proizvodi", "20");
let konditori = new ProductGroup("Konditori", "80");

let mleko = new Product("3235653236", "Mleko", 100);
mleko.group = mlecniProizvodi;
let pavlaka = new Product("3235087987", "Pavlaka", 50);
pavlaka.group = mlecniProizvodi;
let cokolada = new Product("6547821510", "Cokolada", 180);
cokolada.group = konditori;
let plazmaKeks = new Product("6540238658", "Plazma keks", 120);
plazmaKeks.group = konditori;

console.log(Product.nizArtikala);
console.log("----------------------------");

//TESTIRANJE
let b = new ShoppingCartItem("mleko", 5);
console.log(b);
console.log(b.contains("mleko"));
console.log("----------------------------");
let y = new ShoppingCart();
console.log(y);

y.addShoppingItem("mleko", 5);
console.log(y);
y.addShoppingItem("pavlaka", 3);

console.log(y.has("mleko"));

y.addShoppingItem("mleko", 8);
console.log(y);
y.addShoppingItem("pavlaka", 7);
console.log(y);
y.addShoppingItem("cokolada", 20);
y.addShoppingItem("mleko", 1);
console.log(y);
y.addShoppingItem("Plazma keks", 4);
y.addShoppingItem("cokolada", 2);
//treba da bude: mleko 14, pavlaka 10, cokolada 22, plazma 4
console.log(y);


//stampanje racuna za korpu
const btnPrt = document.createElement('button');
divContainer.insertBefore(btnPrt, table);
btnPrt.className = "green_text btn"
btnPrt.textContent = "Stampaj racun";
btnPrt.addEventListener('click', ()=>{
    Checkout.printCheck(y);
})

