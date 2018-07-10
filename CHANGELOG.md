# Changelog

## [Unreleased]

## 16-07-2017
### Изменено
Турбо-страница становится "резиновой". Избавляемся от `media query` и фиксированной ширины сетки. Теперь сетка тянется с фиксированным отступом от края страницы для всех расширений.


## 02-07-2017
### Изменено
Из верстки страниц пропадает сущность `.markup`, избавляемся от лишней вложенности блоков. Также пропадают селекторы `.page__*` и им на смену приходят новые селекторы `.unit`, которые будут стоять у каждого блока и могут использоваться для вертикального выравнивания.
Также базовый шрифт задается у всей страницы и не переопределяется в текстовых блоках.

#### Запрещенные селекторы
* `.markup`, `.markup__*`
* `.page__*`
* `.typo`, `.typo_*`
* `.grid`, `.grid_*`

#### Новые селекторы
* `.unit`, `.unit_rect`, `.unit_text_xl`, `.unit_text_l`, `.unit_text_m`

#### Пример изменения верстки страницы
Было:

```html
<div class="page">
    ...
    <div class="page__result">
        <div class="cover page__unit page__cover">
            <h1 class="title title_level_1 cover__title typo typo_text_xl typo_line_m typo_bold page__title"></h1>
        </div>
        <div class="markup page__unit page__markup">
            <h2 class="title title_level_1 markup__title markup__title_size_m markup__unit typo typo_text_l typo_line_s typo_bold page__title"></h2>
            <p class="paragraph markup__paragraph markup__unit typo typo_text_m typo_line_m">
                ... <a class="link markup__link"></a> ...
            </p>
            <blockquote class="blockquote typo typo_italic typo_text_m typo_line_m markup__unit"></blockquote>
        </div>
        <div class="source page__unit page__source"></div>
        <div class="footer page__footer"></div>
    </div>
    ...
</div>
```

Стало:

```html
<div class="page">
    ...
    <div class="page__result">
        <div class="cover unit unit_rect">
            <h1 class="title title_size_m unit unit_text_l"></h1>
        </div>
        <h2 class="title title_size_m unit unit_text_l"></h2>
        <p class="paragraph unit unit_text_m">
            ... <a class="link"></a> ...
        </p>
        <blockquote class="blockquote unit unit_rect"></blockquote>
        <div class="source unit unit_rect"></div>
        <div class="footer"></div>
    </div>
    ...
</div>
```
