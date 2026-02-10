
// Данные о товарах
const products = [
  { id: 1, title: "Смартфон Galaxy S23", category: "electronics", description: "Флагманский смартфон с мощной камерой и быстрой зарядкой." },
  { id: 2, title: "Беспроводные наушники", category: "electronics", description: "Высококачественные наушники с шумоподавлением." },
  { id: 3, title: "Планшет iPad Pro", category: "electronics", description: "Мощный планшет для работы и развлечений." },
  { id: 4, title: "Спортивные кроссовки", category: "clothing", description: "Удобная обувь для бега и повседневной носки." },
  { id: 5, title: "Шерстяной свитер", category: "clothing", description: "Теплый свитер из качественной шерсти." },
  { id: 6, title: "Кофемашина", category: "home", description: "Автоматическая кофемашина для приготовления эспрессо." },
  { id: 7, title: "Набор посуды", category: "home", description: "Элегантный набор посуды для сервировки стола." },
  { id: 8, title: "Органайзер для кухни", category: "home", description: "Практичный органайзер для хранения кухонных принадлежностей." },
  { id: 9, title: "Книга по веб-разработке", category: "books", description: "Современное руководство по созданию веб-сайтов." },
  { id: 10, title: "Научно-фантастический роман", category: "books", description: "Захватывающая история о будущем человечества." },
];

// -- Переменные состояния --
let currentPage = 1;
const itemsPerPage = 4;
let currentCategory = 'all';

// -- DOM элементы --
const productsGrid = document.getElementById('productsGrid');
const paginationEl = document.getElementById('pagination');
const filterButtons = document.querySelectorAll('.filter-btn');

// ---------------------------------------------------- Функция отображения товаров
function renderProducts() {
  // Фильтрация товаров по категории
  const filteredProducts = currentCategory === 'all' 
    ? products 
    : products.filter(product => product.category === currentCategory);
  
  // Расчет количества страниц
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Ограничение текущей страницы
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  // Получение товаров для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Очистка сетки
  productsGrid.innerHTML = '';  
  
  // -- Отображение товаров или сообщения об отсутствии --
  if (pageProducts.length === 0) {
    productsGrid.innerHTML = '<div class="no-products">Товары не найдены</div>';
  } else {
    pageProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image">
          Изображение ${product.title}
          <span class="product-category">${getCategoryName(product.category)}</span>
        </div>
        <div class="product-content">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          <a href="#" class="product-link">Подробнее</a>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }
  
  // -- Обновление пагинации --
  renderPagination(totalPages);
}

// ---------------------------------------------------- Функция отображения пагинации
function renderPagination(totalPages) {
  paginationEl.innerHTML = '';
  
  if (totalPages <= 1) 
    return;
  
  // -- Кнопка "Назад" --
  const prevBtn = document.createElement('button');
  prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = '&laquo;';
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
    }
  });
  paginationEl.appendChild(prevBtn);

  // -- Кнопки страниц --
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
    });
    paginationEl.appendChild(pageBtn);
  }

  // -- Кнопка "Вперед" --
  const nextBtn = document.createElement('button');
  nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = '&raquo;';
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
    }
  });
  paginationEl.appendChild(nextBtn);
}

// ---------------------------------------------------- Вспомогательная функция для получения названия категории
function getCategoryName(category) {
  const categories = {
    'electronics': 'Электроника',
    'clothing': 'Одежда',
    'home': 'Дом',
    'books': 'Книги'
  };
  return categories[category] || category;
}

// -- Обработчики событий для фильтров --
filterButtons.forEach(button => {
  button.addEventListener('click', () => {        
    filterButtons.forEach(btn => btn.classList.remove('active'));  // Убираем активный класс у всех кнопок                
    button.classList.add('active');  // Добавляем активный класс к нажатой кнопке                
    currentCategory = button.dataset.category;  // Обновляем текущую категорию                
    currentPage = 1;  // Сбрасываем страницу на первую                
    renderProducts();  // Перерисовываем товары
  });
});

// -- Инициализация страницы --
renderProducts();
