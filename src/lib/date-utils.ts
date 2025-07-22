/**
 * Crea un nuevo objeto Date en UTC pero utilizando los valores numéricos
 * de la fecha y hora locales.
 * Ejemplo: Si son las 13:00 en Perú (GMT-5), esto crea una fecha
 * que representa las 13:00 UTC.
 */
const removeTimezone = (date: Date): Date => {
    // RESTAMOS el offset para llevar la hora UTC a la hora local
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  };
  
  /**
   * Revierte la operación de removeTimezone. Toma una fecha UTC "falsa"
   * y le aplica el offset para devolverla a su valor original.
   */
  const addTimezone = (date: Date): Date => {
    // SUMAMOS el offset para revertir
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  };
  
  /**
   * Crea una nueva fecha "local" que puede ser enviada a un backend
   * que no interpreta correctamente las zonas horarias.
   */
  const createLocalDate = (): Date => {
    const now = new Date();
    return removeTimezone(now);
  };
  
  export const DateUtils = {
    createLocalDate,
    removeTimezone,
    addTimezone,
  };