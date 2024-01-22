function Hello() {
  const world = "世界";
  return (
    <div>
      <Input placeholder="请输入" />
      你好{world}
    </div>
  );
}

// function Hello() {
//   const world = t('react-i18next-helper/src/react/index/world', { zh: '世界'});
//   return (
//     <div>
//       <Input placeholder={t('react-i18next-helper/src/react/index/enter', { zh: '请输入'})} />{t('react-i18next-helper/src/react/index/hello', { zh: '你好'})}{world}
//     </div>
//   );
// }
