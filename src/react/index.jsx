function Hello() {
  const world = t('world');
  return (
    <div>
      <Input placeholder={t('please-enter')} />{t('hello')}{world}
    </div>
  );
}

// function Hello() {
//   const world = t('world');
//   return (
//     <div>
//       <Input placeholder={t('please-enter')} />{t('hello')}{world}
//     </div>
//   );
// }
