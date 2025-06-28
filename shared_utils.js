// 共用工具函數
class AppUtils {
  constructor() {
    this.config = null;
    this.motivationalTexts = [];
    this.currentIndex = 0;
    this.qa = [];
    this.total = 0;
    this.count = 0;
    this.qright = 0; // Specific to normal mode, but can be a property
    this.mode = 'normal'; // To store the current mode
  }

  // 載入配置檔案
  async loadConfig() {
    try {
      const response = await fetch('config.json');
      this.config = await response.json();
      this.motivationalTexts = this.config.motivationalTexts;
      return this.config;
    } catch (error) {
      console.error('無法載入配置檔案:', error);
      return null;
    }
  }

  // 初始化頁面基本設定
  async initializePage(mode = 'normal') { // Made async to await config loading
    this.mode = mode; // Store the mode
    await this.loadConfig(); // Ensure config is loaded before proceeding

    if (!this.config) {
      console.error('配置檔案尚未載入');
      return;
    }

    // 設定頁面標題和meta資訊
    document.title = this.config.site.title;
    
    // 設定meta標籤
    this.setMetaTags();
    
    // 設定Google Analytics
    this.setupAnalytics();
    
    // 顯示隨機勵志文字
    this.displayRandomMotivationalText();
    
    // 建立導航區域
    this.createNavigation(mode);
    
    // 建立頁腳
    this.createFooter();

    // Setup quiz logic based on mode
    this.setupQuizLogic(mode);
  }

  // 設定meta標籤
  setMetaTags() {
    const metaTags = [
      { property: 'og:title', content: this.config.site.title },
      { property: 'og:description', content: this.config.site.description },
      { property: 'og:type', content: 'website' }
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[property="${tag.property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });
  }

  // 設定Google Analytics
  setupAnalytics() {
    if (this.config.analytics.googleAnalyticsId) {
      // 建立gtag script
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.analytics.googleAnalyticsId}`;
      document.head.appendChild(gtagScript);

      // 建立gtag配置script
      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${this.config.analytics.googleAnalyticsId}');
      `;
      document.head.appendChild(configScript);
    }
  }

  // 顯示隨機勵志文字
  displayRandomMotivationalText() {
    if (this.motivationalTexts.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.motivationalTexts.length);
      const text = this.motivationalTexts[randomIndex];
      
      const element = document.getElementById('motivational-text');
      if (element) {
        element.textContent = text;
      }
    }
  }

  // 建立導航區域
  createNavigation(mode) {
    const navContainer = document.getElementById('navigation');
    if (!navContainer) return;

    const navHTML = `
      <div class="nav-links">
        <a href="${this.config.links.mainLaw}" target="_blank" class="nav-link">母法</a>
        <a href="${this.config.links.detailRules}" target="_blank" class="nav-link">細則</a>
        <button class="toggle-btn" id="sub-laws-toggle">子法&作業</button>
        <button class="toggle-btn" id="table-toggle">金額級距彙整表</button>
        <a href="${mode === 'fast' ? 'index.html' : 'fast.html'}" class="nav-link">
          ${mode === 'fast' ? '一般模式' : '快速模式'}
        </a>
      </div>
      
      <div class="collapsible-panel" id="sub-laws-panel">
        <div class="panel-content">
          <div class="sub-nav-grid">
            ${this.config.links.subLaws.map(link => 
              `<a href="${link.url}" target="_blank" class="sub-nav-link">${link.name}</a>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <div class="collapsible-panel" id="table-panel">
        <div class="panel-content">
          <div class="table-container">
            ${this.createAmountTable()}
          </div>
          <button class="close-btn" id="close-table">關閉</button>
        </div>
      </div>
    `;

    navContainer.innerHTML = navHTML;
    this.setupNavigationEvents();
  }

  // 建立金額級距表
  createAmountTable() {
    return `
      <table>
        <thead>
          <tr>
            <th rowspan="2">採購金額 (細則§6)</th>
            <th colspan="3">採購案件性質(GPL§7)</th>
            <th rowspan="2">招標/決標方式、決標原則</th>
          </tr>
          <tr>
            <th>工程</th>
            <th>財物</th>
            <th>勞務</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>巨額</td>
            <td>2億元以上</td>
            <td>1億元以上</td>
            <td>2千萬元以上</td>
            <td rowspan="3">
              ◎招標方式<br/>
              1.公開招標（§19）<br/>
              2.選擇性招標(§20、21)<br/>
              3.限制性招標(符合§22-1-1~16)<br/>
              ◎決標原則(§52)：<br/>
              1.訂有底價最低標(§52-1-1)<br/>
              2.未訂底價最低標(§52-1-2)<br/>
              3.最有利標(§52-1-3)<br/>
              4.最高標(細則§109)<br/>
              ◎決標方式<br/>
              1.總價決標 or 單價決標<br/>
              2.複數決標or 非複數決標<br/>
              &nbsp;&nbsp;分項、分組、依數量決標<br/>
              3.固定費用(率)決標
            </td>
          </tr>
          <tr>
            <td>查核金額</td>
            <td colspan="2">5千萬元</td>
            <td>1千萬元</td>
          </tr>
          <tr>
            <td>公告金額</td>
            <td colspan="3">1百萬元</td>
          </tr>
          <tr>
            <td>未達公告金額</td>
            <td colspan="3">逾15萬元未達1百50萬元<br/>($150,001~$1499,999)</td>
            <td>
              ◎招標方式(GPL§49、中央機關未達公告金額採購招標辦法§2、3)<br/>
              1.符合§22-1-1~15(得採限制性招標)<br/>
              2.符合§22-1-16(得採限制性招標)<br/>
              3.公開取得3家以上廠商書面報價或企劃書(公開取得)<br/>
              (1)擇符合需要者→比價、議價<br/>
              (2)公開開標、當場審查、逕行決標(訂明開標時間、地點)<br/>
              (3)家數不足改採限制性比(議)價(需經首長或授權人核准)<br/>
              ◎決標原則、決標方式同上
            </td>
          </tr>
          <tr>
            <td>中央機關小額採購<br/>*地方未定者比照</td>
            <td colspan="3">15萬元以下<br/>($1~$150,000)</td>
            <td>
              中央機關未達公告金額採購招標辦法§5：<br/>
              ※得不經公告程序，逕洽廠商採購，得免提供報價單或企劃書
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 設定導航事件
  setupNavigationEvents() {
    // 子法面板切換
    const subLawsToggle = document.getElementById('sub-laws-toggle');
    const subLawsPanel = document.getElementById('sub-laws-panel');
    
    if (subLawsToggle && subLawsPanel) {
      subLawsToggle.addEventListener('click', () => {
        subLawsPanel.classList.toggle('show');
      });
    }

    // 表格面板切換
    const tableToggle = document.getElementById('table-toggle');
    const tablePanel = document.getElementById('table-panel');
    
    if (tableToggle && tablePanel) {
      tableToggle.addEventListener('click', () => {
        tablePanel.classList.toggle('show');
      });
    }

    // 關閉表格按鈕
    const closeTable = document.getElementById('close-table');
    if (closeTable && tablePanel) {
      closeTable.addEventListener('click', () => {
        tablePanel.classList.remove('show');
      });
    }
  }

  // 建立頁腳
  createFooter() {
    const footerContainer = document.getElementById('footer');
    if (!footerContainer) return;

    const footerHTML = `
      網站原始碼 by ${this.config.site.author} / 
      資料來源：${this.config.site.dataSource} / 
      本專案採${this.config.site.license}授權，改自<a href="${this.config.site.originalAuthorUrl}" target="_blank">${this.config.site.originalAuthor}</a>
    `;
    footerContainer.innerHTML = footerHTML;
  }

  // 載入並設定問答邏輯
  setupQuizLogic(mode) {
    $.getJSON('qa.json', {}, (r) => {
      this.qa = r;
      this.total = this.qa.length;
      if (mode === 'normal') {
        this.displayNormalQuiz();
      } else if (mode === 'fast') {
        this.displayFastQuiz();
      }
      this.setupQuizNavigationEvents(mode); // Setup navigation after loading quiz data
    });
  }

  // 普通模式的問答顯示邏輯
  displayNormalQuiz() {
    $('#qa-result').html('');
    $('#qa-quiz').html(this.qa[this.currentIndex].quiz);
    let answers = '';
    for (const k in this.qa[this.currentIndex].options) {
      answers += `<label class="radio-inline"><input name="answer" class="qa-options" type="radio" value="${k}" /> &nbsp; ${this.qa[this.currentIndex].options[k]}</label><br />`;
    }
    $('#qa-answer').html(answers);

    $('input.qa-options').off('change').on('change', () => { // Use .off().on() to prevent multiple bindings
      const selected = $('input.qa-options:checked').val(); // Get selected value from the current question
      if (selected == this.qa[this.currentIndex].answer) {
        $('#qa-result').html("答對惹！");
        this.qright++;
      } else {
        $('#qa-result').html(`答錯惹！答案是 -> ${this.qa[this.currentIndex].options[this.qa[this.currentIndex].answer]}`);
      }
      this.updateQuizStatus(); // Update status after answering
    });
    this.updateQuizStatus(); // Initial status update
  }

  // 快速模式的問答顯示邏輯
  displayFastQuiz() {
    $('#qa-result').html('');
    $('#qa-quiz').html(this.qa[this.currentIndex].quiz);
    let answers = '';
    for (const k in this.qa[this.currentIndex].options) {
      if (this.qa[this.currentIndex].answer == k) {
        answers += `<label class="radio-inline" style="color: #e35a54;"><input name="answer" class="qa-options" type="radio" value="${k}" /> &nbsp; ${this.qa[this.currentIndex].options[k]}</label><br />`;
      } else {
        answers += `<label class="radio-inline"><input name="answer" class="qa-options" type="radio" value="${k}" /> &nbsp; ${this.qa[this.currentIndex].options[k]}</label><br />`;
      }
    }
    $('#qa-answer').html(answers);
    
    $('input.qa-options').off('change').on('change', () => { // Use .off().on() to prevent multiple bindings
      $('.qa-next').trigger('click'); // Automatically go to next question
    });
    this.updateQuizStatus(); // Initial status update
  }

  // 更新問答狀態
  updateQuizStatus() {
    if (this.mode === 'normal') {
      if (this.count === 0) {
        $('div#qa-status').html(`第 ${this.currentIndex + 1} 題 / 共 ${this.total} 題，本次練習共累計 ${this.count} 題`);
        this.qright = 0; // Reset qright for a new session
      } else {
        const qansright = (this.qright / this.count) * 100;
        $('div#qa-status').html(`第 ${this.currentIndex + 1} 題 / 共 ${this.total} 題，本次練習共累計 ${this.count} 題，答對 ${this.qright} 題，答對率 ${qansright.toFixed(1)}%`);
      }
    } else if (this.mode === 'fast') {
      $('div#qa-status').html(`第 ${this.currentIndex + 1} 題 / 共 ${this.total} 題，本次練習共累計 ${this.count} 題`);
    }
    this.count++; // Increment count after status update for next question
  }

  // 設定問答導航按鈕事件
  setupQuizNavigationEvents(mode) {
    const displayFunction = mode === 'normal' ? this.displayNormalQuiz.bind(this) : this.displayFastQuiz.bind(this);

    $('.qa-previous').off('click').on('click', (e) => {
      e.preventDefault();
      this.currentIndex -= 1;
      if (this.currentIndex < 0) {
        this.currentIndex = this.total - 1;
      }
      displayFunction();
    });

    $('.qa-rand').off('click').on('click', (e) => {
      e.preventDefault();
      this.currentIndex = Math.floor(Math.random() * this.total); // Fix range for random
      displayFunction();
    });

    $('.qa-next').off('click').on('click', (e) => {
      e.preventDefault();
      this.currentIndex += 1;
      if (this.currentIndex >= this.total) {
        this.currentIndex = 0;
      }
      displayFunction();
    });

    $('.qa-jump').off('click').on('click', (e) => {
      e.preventDefault();
      let input = window.prompt(`輸入 1-${this.total} 數字`);
      let jumpedIndex = parseInt(input) - 1;
      if (!isNaN(jumpedIndex) && jumpedIndex >= 0 && jumpedIndex < this.total) {
        this.currentIndex = jumpedIndex;
        displayFunction();
      } else {
        alert('請輸入有效的數字！');
      }
    });
  }
}
