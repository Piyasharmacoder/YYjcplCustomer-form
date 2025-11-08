// EmailJS Init
emailjs.init("a9pEuwwAdqtI5ThSS");

// DOM Elements
const form = document.getElementById('customerForm');
const fileInput = document.getElementById('resume');
const fileNameDisplay = document.getElementById('fileName');
const previewContainer = document.getElementById('filePreview');
const previewImg = document.getElementById('previewImg');
const fileIconPreview = document.getElementById('fileIconPreview');

// File Preview (Image + PDF First Page)
fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) {
    fileNameDisplay.textContent = '';
    previewContainer.classList.remove('show');
    return;
  }

  fileNameDisplay.textContent = file.name;
  previewImg.style.display = 'none';
  fileIconPreview.innerHTML = '';
  fileIconPreview.style.display = 'none';

  const fileType = file.type;
  const fileExt = file.name.split('.').pop().toLowerCase();

  // IMAGE
  if (fileType.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      previewImg.style.display = 'block';
      previewContainer.classList.add('show');
    };
    reader.readAsDataURL(file);
  } 
  // PDF
  else if (fileExt === 'pdf') {
    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        previewImg.src = canvas.toDataURL();
        previewImg.style.display = 'block';
        previewContainer.classList.add('show');
      } catch (err) {
        console.error("PDF Preview Failed:", err);
        fileIconPreview.innerHTML = '<i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c;"></i>';
        fileIconPreview.style.display = 'block';
        previewContainer.classList.add('show');
      }
    };
    reader.readAsArrayBuffer(file);
  }
  // DOC/DOCX
  else if (['doc', 'docx'].includes(fileExt)) {
    fileIconPreview.innerHTML = '<i class="fas fa-file-word" style="font-size: 4rem; color: #1e88e5;"></i>';
    fileIconPreview.style.display = 'block';
    previewContainer.classList.add('show');
  }
  // Other
  else {
    fileIconPreview.innerHTML = '<i class="fas fa-file" style="font-size: 4rem; color: #95a5a6;"></i>';
    fileIconPreview.style.display = 'block';
    previewContainer.classList.add('show');
  }
});

// Form Submit
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const loader = document.getElementById('loader');
  submitBtn.disabled = true;
  loader.style.display = 'inline-block';
  submitBtn.innerHTML = 'Submitting...';

  // Validation
  let valid = true;
  this.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim() && field !== fileInput) {
      field.style.borderColor = '#e74c3c';
      valid = false;
    } else {
      field.style.borderColor = '#d0e8d5';
    }
  });

  if (!valid) {
    submitBtn.disabled = false;
    loader.style.display = 'none';
    submitBtn.innerHTML = 'Submit Form';
    Swal.fire('Error', 'Please fill all fields.', 'error');
    return;
  }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  const resumeName = fileInput.files[0]?.name || 'No file';

  const today = new Date().toLocaleDateString('en-IN');

  // EXACT VARIABLE NAMES (Check your EmailJS Template!)
  const templateParams = {
    from_name: data.name,
    from_email: data.email,
    phone: data.phone,
    address: data.address,
    profile: data.profile,
    location: data.location,
    salary: data.salary,
    experience: data.experience,
    resume: resumeName,
    today: today
  };

  emailjs.send('service_p84q2b2', 'template_5eifo6n', templateParams)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Submitted successfully!',
        confirmButtonColor: '#56ab2f'
      });
      this.reset();
      fileNameDisplay.textContent = '';
      previewContainer.classList.remove('show');
      submitBtn.disabled = false;
      loader.style.display = 'none';
      submitBtn.innerHTML = 'Submit Form';
    })
    .catch(err => {
      console.error('EmailJS Error:', err);
      Swal.fire('Error', 'Failed to send.', 'error');
      submitBtn.disabled = false;
      loader.style.display = 'none';
      submitBtn.innerHTML = 'Submit Form';
    });
});