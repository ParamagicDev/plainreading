import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="reading_list"
export default class extends Controller {
  static targets = [ "container", "filters", "table", "plannedTable" ]

  // runs on page load.
  connect() {
    this.resetOptions()
    this.goToAnchor()
  }

  // resets sort and filters.
  resetOptions() {
    let firstSort = this.containerTarget.querySelector("rl-sorts input:first-of-type")
    if (firstSort) {
      firstSort.checked = true
    }
    let filters = this.filtersTarget.querySelectorAll("input")
    for (const filter of filters) {
      filter.checked = true
    }
    let starRatingFilter = this.filtersTarget.querySelector("#filter-rating-star")
    if (starRatingFilter) {
      starRatingFilter.checked = false
    }
  }

  // expands the item at the URL's anchor (if any).
  goToAnchor() {
    let anchor = window.location.hash.substr(1)
    if (anchor == "planned") {
      this.containerTarget.querySelector("sl-tab-group").show("planned")
    } else {
      let anchorItem = this.tableTarget.querySelector(`.rl-item[item-id='${anchor}']`)
      if (anchorItem != null) {
        anchorItem.show()
        anchorItem.scrollIntoView()
      }
    }
  }

  // checks/unchecks all according to the "toggle all" checkbox (event.currentTarget).
  toggleRatingCheckboxes(event) {
    let newState = event.currentTarget.checked
    let ratings = this.filtersTarget.querySelectorAll('[id^="filter-rating-"]')
    for (const rating of ratings) {
      rating.checked = newState
    }
    this.filter()
  }

  // checks/unchecks all according to the "toggle all" checkbox (event.currentTarget).
  toggleGenreCheckboxes(event) {
    let newState = event.currentTarget.checked
    let genres = this.filtersTarget.querySelectorAll('[id^="filter-genre-"]')
    for (const genre of genres) {
      genre.checked = newState
    }
    this.filter()
  }

  // expands the rl-filters element to show all filters, when "show all" is clicked (event.target).
  expandFilters(event) {
    event.target.display = "none"
    event.target.parentElement.textContent = "Filters: "
    this.filtersTarget.classList.add("expanded")
    this.filtersTarget.classList.remove("collapsed")
  }

  // shows/hides items (rows) by genre and/or rating.
  filter() {
    let selectedGenres = Array.from(this.filtersTarget.querySelectorAll('[id^="filter-genre-"]'))
                              .map(genre => {
                                if (genre.checked)
                                  return genre.value
                                else
                                  return null
                              })
                              .filter(genre => genre)
    let selectedRatings = Array.from(this.filtersTarget.querySelectorAll('[id^="filter-rating-"]'))
                              .map(rating => {
                                if (rating.checked)
                                  return rating.value
                                else
                                  return null
                              })
                              .filter(rating => rating)
    this.tableTarget.querySelectorAll(".rl-item").forEach(item => {
      let byRating = this.showByRating(item, selectedRatings)
      let byGenre = this.showByGenre(item, selectedGenres)
      if (byRating && byGenre) {
        if (item.parentElement.tagName == "HIDDEN-ITEM-WRAPPER") {
          // show item.
          item.style.display = "block"
          item.parentElement.outerHTML = item.outerHTML
        }
      } else if (item.parentElement.tagName != "HIDDEN-ITEM-WRAPPER") {
        // hide item.
        item.style.display = "none"
        item.outerHTML = "<hidden-item-wrapper>" + item.outerHTML + "</hidden-item-wrapper>"
      }
    })
    this.plannedTableTarget.querySelectorAll(".rl-item").forEach(item => {
      let byGenre = this.showByGenre(item, selectedGenres)
      if (byGenre) {
        if (item.parentElement.tagName == "HIDDEN-ITEM-WRAPPER") {
          // show item.
          item.style.display = "block"
          item.parentElement.outerHTML = item.outerHTML
        }
      } else if (item.parentElement.tagName != "HIDDEN-ITEM-WRAPPER") {
        // hide item.
        item.style.display = "none"
        item.outerHTML = "<hidden-item-wrapper>" + item.outerHTML + "</hidden-item-wrapper>"
      }
    })
  }

  // returns whether item passes the rating filter.
  showByRating(item, selectedRatings) {
    let itemRating = item.querySelector("rl-rating").textContent.trim()
    let starRatingFilter = this.filtersTarget.querySelector("#filter-rating-star")
    if (starRatingFilter) { // star rating mode.
      if (!starRatingFilter.checked) {
        return true
      } else {
        if (itemRating == "⭐") {
          return true
        }
        return false
      }
    } else { // number rating mode (ratingFilter is a menu).
      return selectedRatings.includes(itemRating)
    }
  }

  // returns whether item passes the genre filters.
  showByGenre(item, selectedGenres) {
    let itemGenres = Array.from(item.querySelectorAll("rl-genre")).map(genre => genre.textContent)
    let intersection = itemGenres.filter(g => selectedGenres.includes(g.trim()))
    if (intersection.length == 0) {
      return false
    }
    return true
  }

  // sorts items (rows) by date or rating.
  sort() {
    let selectedSort = this.containerTarget.querySelector('rl-sorts input:checked').value
    if (this.multipleValuesAreVisible(selectedSort)) {
      let sorted = Array.from(this.tableTarget.children).sort((itemA, itemB) => {
        let valueA = itemA.querySelector("rl-" + selectedSort).textContent.trim()
        let valueB = itemB.querySelector("rl-" + selectedSort).textContent.trim()
        if (valueA > valueB || valueA == "in progress")
          return 1
        else if (valueA < valueB)
          return -1
        else { // tie breaker: alphabetical order.
          let nameA = itemA.querySelector("rl-name").textContent.trim().toLowerCase()
          let nameB = itemB.querySelector("rl-name").textContent.trim().toLowerCase()
          if (nameA > nameB)
            return -1
          else if (nameA < nameB)
            return 1
          else
            return 0
        }
      }).reverse()
      sorted.forEach(item => this.tableTarget.appendChild(item))
    }
  }

  multipleValuesAreVisible(valueName) {
    let visibleValues = Array.from(this.tableTarget.querySelectorAll("rl-" + valueName))
                             .filter((el) => !this.isDescendant(el, "HIDDEN-ITEM-WRAPPER"))
                             .map((el) => el.textContent.trim())
    function unique(value, index, self) {
      return self.indexOf(value) === index;
    }
    return (visibleValues.filter(unique).length > 1)
  }

  isDescendant(child, ancestorTagName) {
    let node = child.parentNode
    while (node != null) {
      if (node.tagName == ancestorTagName) {
        return true
      }
      node = node.parentNode
    }
    return false
  }
}
