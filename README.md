# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

---

* models/index.js: в const sequelize не хватает параметра password (третьего по счёту)

* index.js: опечатка `graphgl` -> `graphql`

* query.js
    Нет параметра argumets, но есть args:
    `return models.Event.findAll(argumets, context); -> (args, context);`

    Не передаваютмя параметры (args), вместо них задавется смещение на единицу:
    `return models.Room.findAll({ offset: 1 }, context); -> (args, context);`

* create-mock-data.js: время начала и конца `🍨 Пробуем kefir.js` переставлены местами

* typeDefs.js: в `UserInput` не хватало обязательного параметра `avatarUrl: String!`

* resolvers/index.js: тип `Event` не работал, потому что его методы не были объявлены в typeDefs.js. Запрос данных о пользователях и переговорке для события были добавлены в:
  - `query.event`
  - `query.events`
  - `mutation.createEvent`
  - `mutation.updateEvent`
  - `mutation.removeUserFromEven`
  - `mutation.changeEventRoom`

* mutation.js:
  - не было метода `mutation.addUserToEvent`, объявленного в typeDefs.js
  - `mutation.changeEventRoom` ничего не возвращал
