var filter = {};

function applyFilters() {
    document.querySelectorAll("ul.ratings > li")
        .forEach(el => el.hidden = Object.values(filter).find(f => !f(el)));
}

document.querySelectorAll("ul.tags > li").forEach(el => el.onclick = function(event) {
    var active = event.srcElement.classList.toggle('active');

    var tagName = event.srcElement.innerText;
    var tag = event.srcElement.getAttribute('tag');
    if (active) {
        var rx = new RegExp('\\b' + tag + '\\b');
        filter[tag] = el => rx.test(el.getAttribute('data-tags'));
    } else {
        delete filter[tag];
    }

    applyFilters();
});
