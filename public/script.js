let allPackages = [];
let currentHajjTab = 'non-shifting';

// ========================================
// LOAD PACKAGES AND WEBSITE SETTINGS
// ========================================

async function loadAllData() {
  try {
    const [pkgRes, setRes] = await Promise.all([
      fetch('/api/packages'),
      fetch('/api/settings')
    ]);

    if (!pkgRes.ok || !setRes.ok) {
      throw new Error('Failed to load website data.');
    }

    allPackages = await pkgRes.json();

    const settings = await setRes.json();

    renderHajjPackages(currentHajjCategory);
    renderUmrahPackages();
    populateDropdown();

    if (settings.whatsapp_number) {
      window.dynamicWhatsAppNumber = settings.whatsapp_number;

      const floatWa = document.getElementById('floating-wa-btn');

      if (floatWa) {
        floatWa.setAttribute(
          'href',
          `https://wa.me/${settings.whatsapp_number}`
        );
      }
    }

    if (settings.helpline_number) {
      document.querySelectorAll('.helpline-text').forEach(el => {
        el.innerText = settings.helpline_number;
      });
    }

    if (settings.office_address) {
      document.querySelectorAll(
        '#site-address, .office-address-text'
      ).forEach(el => {
        el.innerText = settings.office_address;
      });
    }

    if (settings.office_email) {
      document.querySelectorAll(
        '#site-email, .office-email-text'
      ).forEach(el => {
        el.innerText = settings.office_email;
      });
    }

    if (settings.office_hours) {
      document.querySelectorAll(
        
        '#site-hours, .office-hours-text'
      ).forEach(el => {
        el.innerText = settings.office_hours;
      });
    }

    if (settings.announcement_text) {
      const noticeEl = document.getElementById(
        'site-announcement-text'
      );

      const footerNotice = document.getElementById(
        'footer-announcement-text'
      );

      if (noticeEl) {
        noticeEl.innerText = settings.announcement_text;
      }

      if (footerNotice) {
        footerNotice.innerText = settings.announcement_text;
      }
    }
  } catch (err) {
    console.error('Error loading website data:', err);
  }
}

// ========================================
// HAJJ CATEGORY FILTER BUTTONS
// ========================================

function switchHajjTab(category) {
  currentHajjTab = category.trim().toLowerCase();
  
  const btnNon = document.getElementById('tab-btn-non-shifting');
  const btnShift = document.getElementById('tab-btn-shifting');

  if (currentHajjTab === 'non-shifting') {
    if (btnNon) btnNon.className = "px-5 py-2.5 rounded-lg bg-white text-[#F26522] text-[14px] font-bold shadow-sm transition-all";
    if (btnShift) btnShift.className = "px-5 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 text-[14px] font-medium transition-all";
  } else {
    if (btnShift) btnShift.className = "px-5 py-2.5 rounded-lg bg-white text-[#F26522] text-[14px] font-bold shadow-sm transition-all";
    if (btnNon) btnNon.className = "px-5 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 text-[14px] font-medium transition-all";
  }

  renderHajjPackages(currentHajjTab);
}

// ========================================
// RENDER HAJJ PACKAGES
// FIX: EXACT CATEGORY MATCHING
// ========================================

function renderHajjPackages(category) {
  const container = document.getElementById('hajj-packages-grid');
  if (!container) return;
  container.innerHTML = '';

  const targetCategory = (category || 'non-shifting').trim().toLowerCase();

  // Filter exact matches from loaded packages
  const filteredPackages = allPackages.filter(p => {
    if (p.type !== 'hajj') return false;
    const pCat = (p.category || 'non-shifting').trim().toLowerCase();
    
    if (targetCategory === 'shifting') {
      return pCat === 'shifting' || pCat.includes('shift');
    } else {
      return pCat === 'non-shifting' || !pCat.includes('shift');
    }
  });


  if (filteredPackages.length === 0) {
    container.innerHTML = `<p class="text-gray-500 col-span-3 text-center py-8">এই ক্যাটাগরিতে কোনো প্যাকেজ পাওয়া যায়নি।</p>`;
    return;
  }

  filteredPackages.forEach((pkg, index) => {
    const isFeatured = (index === 0);
    const cardBorder = isFeatured ? 'border-2 border-[#F26522] shadow-lg relative mt-4 md:mt-0' : 'border border-gray-200 shadow-sm hover:shadow-md transition-shadow mt-4 md:mt-0';
    const badgeHtml = isFeatured ? `<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F26522] text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow whitespace-nowrap">সর্বোচ্চ সমাদৃত • প্যাকেজ</div>` : '';
    
    const starCount = 5 - index;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      const filled = i < starCount ? "style=\"font-variation-settings: 'FILL' 1;\"" : "class=\"text-gray-300\"";
      starsHtml += `<span class="material-symbols-outlined text-[18px]" ${filled}>star</span>`;
    }

    const btnClass = isFeatured ? 'bg-[#F26522] hover:bg-[#d26424] text-white' : 'bg-[#f0eee7] hover:bg-gray-200 text-gray-800';
    const btnText = isFeatured ? 'প্যাকেজ অনুসন্ধান ও বুকিং' : 'প্যাকেজ অনুসন্ধান';

    let desc = pkg.description || 'মক্কা ও মদিনা হোটেল';
    if (!desc.includes('অথবা সমমানের')) {
      desc += ' অথবা সমমানের কোনো হোটেল';
    }

    const isShiftMode = (targetCategory === 'shifting');

    container.innerHTML += `
      <div class="bg-white rounded-2xl ${cardBorder} p-7 flex flex-col justify-between">
        ${badgeHtml}
        <div>
          <div class="flex justify-between items-start pt-2">
            <div>
              <span class="text-[12px] text-gray-500 font-medium block mb-1">${pkg.duration || (isShiftMode ? '৪০ দিন • শিফটিং' : '৪০-৪৫ দিন • নন-শিফটিং')}</span>
              <h3 class="text-2xl font-bold text-gray-900 leading-tight">${pkg.title}</h3>
            </div>
            <div class="flex text-[#333333]">
              ${starsHtml}
            </div>
          </div>

          <div class="mt-5 space-y-3 bg-[#f6f3ec] p-4 rounded-xl border border-[#dec1b4]/30">
            <div class="flex items-start justify-between text-[12px]">
              <span class="flex items-start gap-2 text-gray-700 w-full">
                <span class="material-symbols-outlined text-[16px] text-[#F26522] shrink-0 mt-0.5">location_city</span>
                <span>${desc}</span>
              </span>
            </div>
          </div>

          <ul class="mt-7 space-y-3.5 text-[13px] text-gray-700">
            <li class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[#F26522] text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>${isShiftMode ? 'মিনা শিফটিং এসি তাঁবু ও উন্নত আবাসন' : 'মিনা ভিআইপি এসি তাঁবু (জোন-১, জামারার নিকটে)'}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[#F26522] text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>সৌদি এয়ারলাইন্স / বিমান বাংলাদেশ সরাসরি ফ্লাইট</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[#F26522] text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>প্রতিদিন ৩ বেলা সুস্বাদু বুফে খাবার</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[#F26522] text-[18px] shrink-0 mt-0.5">check_circle</span>
              <span>প্রখ্যাত মুফতি ও বিশিষ্ট আলেম সার্বক্ষণিক সঙ্গে থাকবেন</span>
            </li>
          </ul>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100">
          <div class="flex items-end justify-between mb-5">
            <span class="text-[11px] text-gray-500 font-medium mb-1.5">সর্বমোট মূল্য (জনপ্রতি)</span>
            <div class="text-right">
              <span class="text-[28px] font-bold text-[#F26522]">৳ ${pkg.price}*</span>
              <span class="block text-[11px] text-gray-500 mt-1">বা রিয়াল সমমূল্য</span>
            </div>
          </div>
          <button onclick="openModal('${pkg.title}')" class="w-full ${btnClass} py-3 rounded-lg text-[15px] font-bold flex items-center justify-center gap-2 transition-all">
            <span>${btnText}</span>
            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    `;
  });
}

// ========================================
// RENDER UMRAH PACKAGES
// ========================================

function renderUmrahPackages() {
  const container = document.getElementById('umrah-packages-grid');

  if (!container) return;

  container.innerHTML = '';

  const umrahPkgs = allPackages.filter(p => {
    return String(p.type || '').trim().toLowerCase() === 'umrah';
  });

  if (umrahPkgs.length === 0) {
    container.innerHTML = `
      <p class="text-gray-500 text-center py-8">
        বর্তমানে কোনো উমরাহ প্যাকেজ পাওয়া যায়নি।
      </p>
    `;
    return;
  }

  umrahPkgs.forEach(pkg => {
    let desc = pkg.description || 'মক্কা ও মদিনা হোটেল';

    if (!desc.includes('অথবা সমমানের')) {
      desc += ' অথবা সমমানের কোনো হোটেল';
    }

    container.innerHTML += `
      <div class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">

        <div>

          <h3 class="text-[20px] font-bold text-gray-900 mb-1">
            ${pkg.title}
          </h3>

          <p class="text-[13px] text-gray-500 mb-4">
            ${pkg.duration || ''}
          </p>

          <p class="text-[12px] text-gray-600 bg-[#f6f3ec] p-3 rounded-xl mb-4">
            ${desc}
          </p>

        </div>

        <div class="pt-5 border-t border-gray-100">

          <p class="text-[22px] font-bold text-[#F26522] mb-3">
            ৳ ${pkg.price}
          </p>

          <button
            type="button"
            onclick="openModal(${JSON.stringify(pkg.title)})"
            class="w-full bg-[#f0eee7] hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg text-[14px] font-bold"
          >
            বুকিং ইনকোয়ারি
          </button>

        </div>

      </div>
    `;
  });
}

// ========================================
// WHATSAPP PACKAGE DROPDOWN
// ========================================

function populateDropdown() {
  const select = document.getElementById('wa-package');

  if (!select) return;

  select.innerHTML = `
    <option value="" disabled selected>
      প্যাকেজ নির্বাচন করুন
    </option>
  `;

  allPackages.forEach(p => {
    const option = document.createElement('option');

    option.value = `${p.title} (৳ ${p.price})`;
    option.textContent = `${p.title} - ৳ ${p.price}`;

    select.appendChild(option);
  });
}

// ========================================
// FAQ ACCORDION
// ========================================

function toggleFaq(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);

  if (!el || !icon) return;

  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
    icon.classList.add('rotate-180');
  } else {
    el.classList.add('hidden');
    icon.classList.remove('rotate-180');
  }
}

// ========================================
// BOOKING MODAL
// ========================================

const modal = document.getElementById('booking-modal');

function openModal(packageName) {
  const packageInput = document.getElementById('package-name');

  if (packageInput) {
    packageInput.value = packageName || 'সাধারণ ইনকোয়ারি';
  }

  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Support buttons using the .booking-btn class.
document.addEventListener('click', e => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const btn = target.closest('.booking-btn');

  if (!btn) return;

  e.preventDefault();

  let pkgName = 'সাধারণ ইনকোয়ারি';

  const card = btn.closest('.bg-white');

  if (card) {
    const titleEl = card.querySelector('h3');

    if (titleEl) {
      pkgName = titleEl.innerText.trim();
    }
  }

  openModal(pkgName);
});

// ========================================
// BOOKING FORM SUBMISSION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('user-name')?.value.trim() || '';
    const phone = document.getElementById('user-phone')?.value.trim() || '';
    const packageName =
      document.getElementById('package-name')?.value || '';

    const message =
      document.getElementById('user-message')?.value.trim() || '';

    if (!name || !phone) {
      alert('অনুগ্রহ করে আপনার নাম এবং ফোন নম্বর দিন।');
      return;
    }

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_name: packageName,
          name,
          phone,
          message
        })
      });

      if (response.ok) {
        alert('আলহামদুলিল্লাহ! আপনার ইনকোয়ারি সফলভাবে জমা হয়েছে।');

        form.reset();
        closeModal();
      } else {
        alert('দুঃখিত, সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('সার্ভারের সঙ্গে সংযোগ করা যায়নি। আবার চেষ্টা করুন।');
    }
  });
});

// ========================================
// WHATSAPP PASSENGER COUNTER
// ========================================

function incrementCount() {
  const input = document.getElementById('wa-count');

  if (!input) return;

  const current = parseInt(input.value, 10) || 1;

  input.value = current + 1;
}

function decrementCount() {
  const input = document.getElementById('wa-count');

  if (!input) return;

  const current = parseInt(input.value, 10) || 1;

  if (current > 1) {
    input.value = current - 1;
  }
}

// ========================================
// WHATSAPP INQUIRY FORM
// ========================================

async function sendToWhatsApp(e) {
  e.preventDefault();

  const name =
    document.getElementById('wa-name')?.value.trim() || '';

  const phone =
    document.getElementById('wa-phone')?.value.trim() || '';

  const pkg =
    document.getElementById('wa-package')?.value || '';

  const count =
    document.getElementById('wa-count')?.value.trim() || '1';

  const msg =
    document.getElementById('wa-message')?.value.trim() || '';

  if (!name || !phone || !pkg) {
    alert('অনুগ্রহ করে নাম, ফোন নম্বর এবং প্যাকেজ নির্বাচন করুন।');
    return;
  }

  const text = `আসসালামু আলাইকুম।
নাম: ${name}
ফোন: ${phone}
প্যাকেজ: ${pkg}
যাত্রী সংখ্যা: ${count}
বার্তা: ${msg}`;

  // Save the inquiry to the database.
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_name: `${pkg} (যাত্রী: ${count})`,
        name,
        phone,
        message: msg
      })
    });

    if (!response.ok) {
      console.error('Could not save inquiry to database.');
    }
  } catch (err) {
    console.error('Database save error:', err);
  }

  const waNumber =
    window.dynamicWhatsAppNumber || '8801800000999';

  const whatsappUrl =
    `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  window.open(whatsappUrl, '_blank');

  const form = document.getElementById('whatsapp-inquiry-form');

  if (form) {
    form.reset();
  }
}

// ========================================
// INITIALIZE WEBSITE
// ========================================

loadAllData();