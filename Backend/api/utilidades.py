
def texto_opcional(valor, default=""):
    if valor is None:
        return default
    return valor

def valor_dict(diccionario, clave, default=None):
    if clave not in diccionario:
        return default
    return diccionario[clave]
