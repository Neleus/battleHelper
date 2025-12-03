// ==UserScript==
// @name           HWM Multi Transfer Artifacts
// @author         Neleus
// @namespace      Neleus
// @description    Мультипередача артефактов
// @version        1.0
// @include        https://www.heroeswm.ru/inventory.php*
// @include        https://mirror.heroeswm.ru/inventory.php*
// @include        https://lordswm.com/inventory.php*
// @include        https://my.lordswm.com/inventory.php*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @license        GNU GPLv3

;(function () {
  "use strict"

  // ==================== CONSTANTS ====================
  const DATA = document.documentElement.innerHTML
  const ID = /pl_hunter_stat.php\?id=(\d+)/.exec(DATA)
  if (!ID) return

  const userID = ID[1]
  let IMG_LINK = "https://dcdn.heroeswm.ru/i/"
  if (/lordswm/.test(location.origin)) {
    IMG_LINK = "https://cfcdn.lordswm.com/i/"
  }
  if (/mirror/.test(location.origin)) {
    IMG_LINK = "https://qcdn.heroeswm.ru/i/"
  }

  // _RENTSHOP used for owner identification (kept for potential future use)

  // ==================== STYLES ====================
  const styles = `
    .mtrans-container {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto;
      gap: 5px;
    }
    .mtrans-btn-anim {
      border-radius: 5px;
      animation: .5s linear infinite alternate mtrans-btn-anim;
    }
    @keyframes mtrans-btn-anim {
      from { outline: 4px dashed #aac7f500; }
      to { outline: 4px dashed #aac7f5ff; }
    }
    .mtrans-footer input, .mtrans-footer select {
      margin: 5px 0;
    }
    #btn_transfer {
      margin-top: 10px;
      padding: 4px;
      width: 100%;
    }
    .mtrans-header {
      width: 235px;
      text-align: center;
    }
    #art-name {
      height: 30px;
      font-weight: bold;
    }
    .mtrans-arts {
      width: 455px;
      height: 192px;
      overflow-y: scroll;
      padding: 2px;
      border: 1px dashed #aaa;
    }
    .mtrans-pool {
      font-size: 9pt;
      border: 1px dashed #aaa;
    }
    .mtrans-poolarts {
      padding: 0 4px;
      height: 156px;
      overflow-y: scroll;
    }
    .pool-element {
      display: grid;
      grid-template-columns: 345px 45px auto;
    }
    .pool-header {
      text-align: center;
      padding: 2px;
      background: #dde;
    }
    .pool-selected {
      outline: 1px dotted #aaa;
    }
    .mtrans-item {
      display: inline-block;
      margin: 2px !important;
    }
    .mtrans-selected {
      outline: 1px solid #000;
    }
    .mtrans-dur {
      position: absolute;
      font-size: 90%;
      top: 1px;
      left: 1px;
      z-index: 2;
      background: #fff8;
      pointer-events: none;
    }
    .dur-warn {
      color: #fff;
      background: #f008;
    }
    .ppb-warn {
      border: 2px solid #f00;
    }
    .mtrans-chk {
      position: absolute;
      top: 1px;
      right: 1px;
      z-index: 2;
    }
    .mtrans-pbar {
      width: 100%;
      display: none;
    }
    .mtrans-badge {
      outline: 3px dashed #ACE;
    }
    .no-events {
      pointer-events: none;
    }
    .thin-scrollbar::-webkit-scrollbar {
      width: 7px;
    }
    .thin-scrollbar::-webkit-scrollbar-thumb {
      background: #fff;
      border-radius: 5px;
    }
    .thin-scrollbar::-webkit-scrollbar-track {
      background: #5554;
    }
  `

  // Inject styles
  const styleElement = document.createElement("style")
  styleElement.textContent = styles
  document.head.appendChild(styleElement)

  // ==================== UTILITY FUNCTIONS ====================
  const qSelect = (selector, context = document) => context.querySelector(selector)

  const loadPage = async (url) => {
    const response = await fetch(url)
    return await pageDecoder(response)
  }

  const pageDecoder = async (response) => {
    const buffer = await response.arrayBuffer()
    const view = new DataView(buffer)
    return new TextDecoder("windows-1251").decode(view)
  }

  // Storage functions using GM_getValue/GM_setValue
  const getStorage = (key, defaultValue = null) => {
    const value = GM_getValue(key, defaultValue)
    return value
  }

  const setStorage = (key, value) => {
    GM_setValue(key, value)
  }

  // ==================== ARTS EXTRACTION ====================
  let INV_ARTS_OBJ = {}

  const getArtsFromPage = () => {
    return new Promise((resolve) => {
      // Extract arts from page's global 'arts' variable
      const script = document.createElement("script")
      script.textContent = `
        if (typeof arts !== 'undefined') {
          const arts_obj = {};
          arts.forEach((s, t) => arts_obj[t] = Object.values(s));
          window.postMessage({ type: 'HWM_ARTS', data: arts_obj }, '*');
        }
      `
      document.body.appendChild(script)
      script.remove()

      const handler = (event) => {
        if (event.data && event.data.type === "HWM_ARTS") {
          window.removeEventListener("message", handler)
          resolve(event.data.data)
        }
      }
      window.addEventListener("message", handler)

      // Timeout fallback
      setTimeout(() => {
        window.removeEventListener("message", handler)
        resolve({})
      }, 1000)
    })
  }

  // ==================== FRIENDS LIST ====================
  const getFriendsList = async () => {
    const page = await loadPage("friends.php")
    const matches = [...page.matchAll(/([\wа-яё\-\(\) ]+) \[/gi)]
    let options = ""
    for (const match of matches) {
      options += `<option value="${match[1]}">${match[1]}</option>`
    }
    return options
  }

  // ==================== HELPER FUNCTIONS ====================
  const getCurrentCat = () => {
    const activeTab = qSelect(".filter_tab_active")
    return activeTab ? activeTab.getAttribute("hint") : ""
  }

  const getIndex = (artId) => {
    return Object.keys(INV_ARTS_OBJ).find((t) => INV_ARTS_OBJ[t][0] == artId) || -1
  }

  const parseSuffix = (mods) => {
    let result = ""
    const matches = [...mods.matchAll(/\w\d+/g)].flatMap((e) => e)
    for (let mod of matches) {
      result += `<img src="${IMG_LINK}mods_png/24/${mod}.png">`
    }
    return result
  }

  const urlencode = (str) => {
    let result = ""
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i)
      // Convert Unicode Cyrillic to windows-1251
      if (code >= 1040 && code <= 1103) {
        code -= 848
      }
      if (code === 1025) code = 168
      if (code === 1105) code = 184

      // Percent-encoding
      if (/[A-Za-z0-9\-_.~]/.test(String.fromCharCode(code))) {
        result += String.fromCharCode(code)
      } else {
        result += "%" + code.toString(16).toUpperCase().padStart(2, "0")
      }
    }
    return result
  }

  // ==================== MULTI TRANSFER BADGES ====================
  const setMTransferBadges = (translist, container) => {
    for (let artId in translist) {
      const idx = getIndex(artId)
      const element = qSelect(`[art_idx="${idx}"]`, container)
      if (element) {
        element.classList.add("mtrans-badge")
      }
    }
  }

  // ==================== POOL FUNCTIONS ====================
  const poolToSession = (poolData) => {
    sessionStorage.setItem("mtrans", JSON.stringify(poolData))
  }

  const checkBattlesCount = (poolData) => {
    for (let artId in poolData.arts) {
      const element = qSelect(`[data-id="${artId}"]`)
      if (!element) continue
      const durDiv = element.firstChild
      if (poolData.arts[artId].dur1 < poolData.battles && poolData.selected.includes(artId)) {
        durDiv.classList.add("dur-warn")
      } else {
        durDiv.classList.remove("dur-warn")
      }
    }
  }

  const checkPPB = (poolData, artId) => {
    const ppbInput = qSelect("#ppb")
    if (!ppbInput || !poolData.arts[artId]) return
    if (poolData.battles > 0 && poolData.arts[artId].ppb === 0 && poolData.selected.includes(artId)) {
      ppbInput.classList.add("ppb-warn")
    } else {
      ppbInput.classList.remove("ppb-warn")
    }
  }

  const checkTransEnable = (poolData, button) => {
    let hasZeroPPB = false
    if (poolData.battles > 0) {
      for (let artId of poolData.selected) {
        if (poolData.arts[artId].ppb === 0) {
          hasZeroPPB = true
          break
        }
      }
    }
    button.disabled =
      poolData.selected.length === 0 || poolData.days === 0 || !poolData.renter || hasZeroPPB
  }

  const showPool = (poolData, selectedItem) => {
    let html =
      '<div class="pool-element pool-header"><div>Артефакт</div><div>Сумма</div><div>Комиссия</div></div><div class="mtrans-poolarts thin-scrollbar">'
    let num = 1
    let totalSum = 0
    let totalComm = 0

    for (let artId of poolData.selected) {
      const name = poolData.arts[artId].name
      const dur1 = poolData.arts[artId].dur1
      const dur2 = poolData.arts[artId].dur2
      let sum = poolData.arts[artId].ppb * (poolData.battles > dur1 ? dur1 : poolData.battles)
      let comm = Math.round(sum / 100)
      if (sum < 50 && sum > 0) comm = 1

      totalSum += sum
      totalComm += comm

      const isSelected = selectedItem && selectedItem.dataset.id === artId
      html += `<div class="pool-element${isSelected ? " pool-selected" : ""}"><div>${num}. ${name} [${dur1}/${dur2}]</div><div>${sum}</div><div>${comm}</div></div>`
      num++

      poolData.arts[artId].summ = sum
    }

    html += "</div>"
    qSelect("#pool").innerHTML = html
    qSelect("#summ").textContent = totalSum
    qSelect("#comm").textContent = totalComm
  }

  const setSelected = (poolData, selectedItem) => {
    const ppbInput = qSelect("#ppb")
    const artNameDiv = qSelect("#art-name")
    const removeBtn = qSelect("#btn_remove")
    const saveBtn = qSelect("#btn_save")

    if (!selectedItem) {
      artNameDiv.textContent = "Перетащите на эту вкладку несколько артефактов"
      ppbInput.value = 0
      ppbInput.disabled = removeBtn.disabled = saveBtn.disabled = true
      return
    }

    const selectedClass = "mtrans-selected"
    const prevSelected = qSelect(`.${selectedClass}`)
    if (prevSelected) {
      prevSelected.classList.remove(selectedClass)
    }
    selectedItem.classList.add(selectedClass)

    const artId = selectedItem.dataset.id
    checkPPB(poolData, artId)

    artNameDiv.textContent = `${poolData.arts[artId].name} [${poolData.arts[artId].dur1}/${poolData.arts[artId].dur2}]`
    ppbInput.value = poolData.arts[artId].ppb
    ppbInput.disabled = removeBtn.disabled = saveBtn.disabled = false
  }

  // ==================== TRANSFER EXECUTION ====================
  const transferPool = async (poolData) => {
    const errorDiv = qSelect("#mtrans-error")
    const progressBar = qSelect(".mtrans-pbar")
    progressBar.style.display = "block"
    errorDiv.innerHTML = "<br>"

    const sign = /sign='(\w+)/.exec(DATA)[1]
    const progressStep = 100 / poolData.selected.length
    let hasError = false

    for (let artId of poolData.selected) {
      const response = await fetch("art_transfer.php", {
        method: "POST",
        redirect: "manual",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${artId}&nick=${urlencode(poolData.renter)}&gold=${poolData.arts[artId].summ}&sendtype=2&dtime=${poolData.days}&bcount=${poolData.battles}&rep_price=0&art_id=&sign=${sign}`,
      })

      if (response.ok) {
        progressBar.style.display = "none"
        const html = await pageDecoder(response)
        const doc = new DOMParser().parseFromString(html, "text/html")
        const errorFont = qSelect("td>font", doc)
        errorDiv.append(errorFont)
        qSelect("#btn_transfer").disabled = false
        hasError = true
        break
      }
      progressBar.value += progressStep
    }

    if (!hasError) {
      sessionStorage.clear()
      sessionStorage.setItem("redirect", "true")
      location.reload()
    }
  }

  // ==================== MULTI TRANSFER PANEL ====================
  const MTPanel = async (container, friendsOptions, translist) => {
    let poolData = {
      arts: {},
      selected: [],
      days: 0,
      hours: 0,
      battles: 0,
      renter: "",
    }

    let html = ""
    html += '<div class="mtrans-container">'
    html += '<div class="mtrans-header"><div id="art-name"></div>'
    html +=
      '<br>Стоимость боя <input onkeypress="return /\\d/.test(event.key)" id="ppb" type="text" maxlength="4" size="4" placeholder="0">'
    html +=
      "<br><br><button id=btn_save>Сохранить значение</button><br><br><button id=btn_remove>Убрать артефакт</button>"
    html += '</div><div class="mtrans-arts thin-scrollbar">'

    // Sort artifacts by index
    const sortedIds = Object.keys(translist).sort((a, b) => getIndex(a) - getIndex(b))

    for (let artId of sortedIds) {
      const idx = getIndex(artId)
      if (idx === -1 || INV_ARTS_OBJ[idx][12] !== 0 || INV_ARTS_OBJ[idx][20] === 1) {
        continue
      }

      const name = INV_ARTS_OBJ[idx][3]
      const dur1 = INV_ARTS_OBJ[idx][5]
      const dur2 = INV_ARTS_OBJ[idx][6]
      const imgPath = INV_ARTS_OBJ[idx][7]
      const imgMatch = /artifacts\/((?:\w+\/)*[\w-]+)/.exec(imgPath)
      const artImage = imgMatch ? imgMatch[1] : ""
      const mods = INV_ARTS_OBJ[idx][8]
      const modsHtml = parseSuffix(mods)

      poolData.arts[artId] = {}
      poolData.arts[artId].name = name + mods
      poolData.arts[artId].ppb = translist[artId]
      poolData.arts[artId].dur1 = dur1
      poolData.arts[artId].dur2 = dur2

      html += `<div class="inventory_item_div mtrans-item" data-id=${artId} art_idx=${idx}>`
      html += `<div class="mtrans-dur">${dur1}/${dur2}</div>`
      html += '<input type="checkbox" class="mtrans-chk">'
      html += `<img src="${IMG_LINK}art_fon_100x100.png" height=100%>`
      html += `<img src="${IMG_LINK}artifacts/${artImage}.png" height=100% class="cre_mon_image2">`
      html += `<div class="art_mods no-events">${modsHtml}</div></div>`
    }

    html += '</div><div class="mtrans-footer">'
    html += `<select style="width:100%" id="friends"><option selected disabled>Выбрать получателя из друзей</option>${friendsOptions}</select><br>`
    html += 'Получатель <input id=renter type=text style="width:155px" value=""><br>Передать с возвратом через:<br>'
    html +=
      '<input onkeypress="return /\\d|\\./.test(event.key)" style="width:42px" id=hours type=text maxlength="3" placeholder="0"> часов'
    html +=
      ' <input onkeypress="return /\\d/.test(event.key)" style="width:42px" id=days type=text maxlength="3" placeholder="0"> дней'
    html +=
      ' <input onkeypress="return /\\d/.test(event.key)" style="width:24px" id=bcount type=text maxlength="2" placeholder="0"> боёв<br>'
    html += 'Общая стоимость: <span id=summ>0</span><br>Общая комиссия: <span id=comm>0</span>'
    html += '<button id=btn_transfer>Передать</button></div>'
    html +=
      '<div id=pool class=mtrans-pool></div></div><progress class=mtrans-pbar max="100" value="0"></progress><div id=mtrans-error></div>'

    container.innerHTML = html

    const renterInput = qSelect("#renter")
    const bcountInput = qSelect("#bcount")
    const daysInput = qSelect("#days")
    const hoursInput = qSelect("#hours")
    const transferBtn = qSelect("#btn_transfer")
    let currentItem = qSelect(".mtrans-item")

    // Check for saved player name
    const savedPlayerName = sessionStorage.getItem("pl_name")
    if (savedPlayerName) {
      poolData.renter = renterInput.value = savedPlayerName
    }

    // Restore session data
    const savedSession = sessionStorage.getItem("mtrans")
    if (savedSession) {
      const savedData = JSON.parse(savedSession)
      if (!savedPlayerName) {
        poolData.renter = renterInput.value = savedData.renter
      }
      poolData.battles = savedData.battles
      bcountInput.value = poolData.battles === 0 ? "" : poolData.battles
      poolData.days = savedData.days
      daysInput.value = poolData.days === 0 ? "" : poolData.days
      poolData.hours = savedData.hours
      hoursInput.value = poolData.hours === 0 ? "" : poolData.hours
      poolData.selected = savedData.selected

      for (let artId of poolData.selected) {
        if (artId in poolData.arts) {
          const checkbox = qSelect(`[data-id="${artId}"]`)
          if (checkbox) {
            checkbox.firstChild.nextSibling.checked = true
          }
        } else {
          poolData.selected = poolData.selected.filter((id) => id !== artId)
        }
      }
    }

    showPool(poolData, currentItem)
    poolToSession(poolData)
    setSelected(poolData, currentItem)
    checkTransEnable(poolData, transferBtn)
    checkBattlesCount(poolData)

    // Event listeners
    transferBtn.addEventListener("click", (e) => {
      e.target.disabled = true
      transferPool(poolData)
    })

    qSelect(".mtrans-arts").addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") {
        currentItem = e.target.parentNode
        setSelected(poolData, currentItem)
        showPool(poolData, currentItem)
      }

      if (e.target.tagName === "INPUT") {
        const artId = e.target.parentNode.dataset.id
        if (e.target.checked) {
          poolData.selected.push(artId)
        } else {
          poolData.selected = poolData.selected.filter((id) => id !== artId)
        }
        currentItem = e.target.parentNode
        setSelected(poolData, currentItem)
        showPool(poolData, currentItem)
        poolToSession(poolData)
        checkTransEnable(poolData, transferBtn)
        checkBattlesCount(poolData)
      }
    })

    qSelect("#btn_save").addEventListener("click", async () => {
      const artId = currentItem.dataset.id
      poolData.arts[artId].ppb = translist[artId] = +qSelect("#ppb").value
      setStorage(userID + "_translist", translist)
      showPool(poolData, currentItem)
      poolToSession(poolData)
      checkPPB(poolData, artId)
      checkTransEnable(poolData, transferBtn)
    })

    qSelect("#btn_remove").addEventListener("click", async () => {
      const artId = currentItem.dataset.id
      delete translist[artId]
      delete poolData.arts[artId]
      poolData.selected = poolData.selected.filter((id) => id !== artId)
      currentItem.remove()
      setStorage(userID + "_translist", translist)

      currentItem = qSelect(".mtrans-item")
      setSelected(poolData, currentItem)
      showPool(poolData, currentItem)
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
    })

    renterInput.addEventListener("input", (e) => {
      poolData.renter = e.target.value.trim()
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
    })

    qSelect("#friends").addEventListener("change", (e) => {
      poolData.renter = renterInput.value = e.target.value
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
    })

    daysInput.addEventListener("input", () => {
      let days = +daysInput.value
      if (days > 365) days = 365
      const hours = days * 24
      hoursInput.value = hours
      poolData.hours = hours
      poolData.days = days
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
    })

    hoursInput.addEventListener("input", () => {
      const hours = +hoursInput.value
      if (isNaN(hours) || hours < 0.1) return
      const days = (hours / 24).toFixed(3)
      daysInput.value = days
      poolData.hours = hours
      poolData.days = days
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
    })

    bcountInput.addEventListener("input", (e) => {
      poolData.battles = +e.target.value
      showPool(poolData, currentItem)
      poolToSession(poolData)
      checkTransEnable(poolData, transferBtn)
      checkBattlesCount(poolData)
      if (currentItem) {
        checkPPB(poolData, currentItem.dataset.id)
      }
    })
  }

  // ==================== MAIN MULTI TRANSFER FUNCTION ====================
  const multiTransfer = async (container) => {
    let draggedIndex = null
    let draggedArtId = null

    const tabsBlock = qSelect(".filter_tabs_block")
    const activeClass = "filter_tab_active"
    const hoverClass = "filter_tab_for_hover"

    // Create multi-transfer button with inline SVG icon (arrows pointing right = multi-transfer)
    const mtransIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><path d="M5 9h14l-4-4M5 15h14l-4 4"/></svg>')}`

    tabsBlock.insertAdjacentHTML(
      "beforeend",
      `<div id=mtrans_btn hint="mtrans" title="Мультипередача артефактов" style="background:url('${mtransIcon}') no-repeat center, #fff; background-size: 20px;" class="filter_tab ${hoverClass}"></div>`
    )

    const mtransBtn = qSelect("#mtrans_btn")
    let translist = getStorage(userID + "_translist", {})

    setMTransferBadges(translist, container)

    const friendsOptions = await getFriendsList()

    // Click handler - open transfer panel
    mtransBtn.addEventListener("click", () => {
      const currentActive = qSelect(`.${activeClass}`)
      if (currentActive !== mtransBtn) {
        if (currentActive) {
          currentActive.classList.replace(activeClass, hoverClass)
        }
        mtransBtn.classList.replace(hoverClass, activeClass)

        const returnAllRents = qSelect("#return_all_rents")
        if (returnAllRents) {
          returnAllRents.style.display = "none"
        }

        MTPanel(container, friendsOptions, translist)
      }
    })

    // Drag start - detect which artifact is being dragged
    container.addEventListener("dragstart", (e) => {
      let target = e.target
      while (!(draggedIndex = target.getAttribute("art_idx"))) {
        target = target.parentNode
      }
      draggedArtId = INV_ARTS_OBJ[draggedIndex][0]

      // Animate button if artifact can be transferred ([23] === 0 means blocked)
      // Original: 0===INV_ARTS_OBJ[s][23]||r in l||i.classList.add("mtrans-btn-anim")
      if (INV_ARTS_OBJ[draggedIndex][23] !== 0 && !(draggedArtId in translist)) {
        mtransBtn.classList.add("mtrans-btn-anim")
      }
    })

    // Drag over - allow drop if artifact can be transferred
    mtransBtn.addEventListener("dragover", (e) => {
      // Original: 0===INV_ARTS_OBJ[s][23]||r in l||e.preventDefault()
      if (INV_ARTS_OBJ[draggedIndex][23] !== 0 && !(draggedArtId in translist)) {
        e.preventDefault()
      }
    })

    // Drag end - remove animation
    document.addEventListener("dragend", () => {
      mtransBtn.classList.remove("mtrans-btn-anim")
    })

    tabsBlock.addEventListener("drop", () => {
      mtransBtn.classList.remove("mtrans-btn-anim")
    })

    // Drop handler - add artifact to transfer list
    mtransBtn.addEventListener("drop", () => {
      translist[draggedArtId] = 0
      setStorage(userID + "_translist", translist)
      setMTransferBadges(translist, container)
    })

    // Auto-open panel if redirected from profile
    if (sessionStorage.getItem("redirect")) {
      sessionStorage.removeItem("redirect")
      mtransBtn.click()
    }
  }

  // ==================== INITIALIZATION ====================
  const init = async () => {
    INV_ARTS_OBJ = await getArtsFromPage()

    const container = qSelect("#inventory_block")
    if (!container) return

    // Watch for inventory changes
    const observer = new MutationObserver(async () => {
      INV_ARTS_OBJ = await getArtsFromPage()
      const currentCat = getCurrentCat()

      if (currentCat !== "mtrans") {
        const translist = getStorage(userID + "_translist", {})
        setMTransferBadges(translist, container)
      }
    })

    observer.observe(container, { childList: true, subtree: true })

    // Initialize multi-transfer
    await multiTransfer(container)
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
