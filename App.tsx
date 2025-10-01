import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Image, Pressable } from "react-native";
import * as SQLite from "expo-sqlite"

export default function App() {

  type Contato = {
    id: number;
    nome: string;
    telefone: string;
    email: string;
  }

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initDb = async () => {
      const database: SQLite.SQLiteDatabase =
        await SQLite.openDatabaseAsync("contatos.db");
      setDb(database);
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS contatos ( 
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          nome TEXT, telefone TEXT, email TEXT 
        ); 
      `)
    };
    initDb();
  }, []);

  useEffect(() => {
    carregarContatos();
  }, [db]);

  const adicionarContato = async () => {
    if (!db) {
      return;
    }
    if (nome.trim() === "") {
      return;
    }
    await db.runAsync("INSERT INTO contatos(nome, telefone, email) VALUES (?, ?, ?);", [nome, telefone, email]);
    setNome(nome);
    setTelefone(telefone);
    setEmail(email);

    carregarContatos();
  }

  const carregarContatos = async () => {
    if (!db)
      return;
    const r = await db.getAllAsync<Contato>("SELECT * FROM contatos;");
    setContatos(r);
  }

  const atualizarContato = async (id: number, nome: string, telefone: string, email: string) => {
    if (!db) {
      return;
    }
    await db.runAsync("UPDATE contatos SET nome = ?, telefone = ?, email = ?, WHERE id = ?;", [nome, telefone, email, id]);
    carregarContatos();
  }

  const deletarContato = async (id: number) => {
    if (!db) {
      return;
    }
    await db.runAsync("DELETE FROM contatos WHERE id = ?;", [id]);
    carregarContatos();
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Image style={{ width: 80, height: 60, }} source={require('./assets/logo-garfield.png')}></Image>
        <Text style={styles.titulo}>Contatos do Garfield</Text>
      </View>

      <TextInput
        placeholder="Nome do contato"
        value={nome}
        onChangeText={setNome}
        style={styles.texto}
      />
      <TextInput
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        style={styles.texto}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.texto}
      />
      <Button title="Adicionar" onPress={adicionarContato} />

      <FlatList
        data={contatos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.lista}>
            <View style={{ flexDirection: "column" }}>
              <Text>{item.nome}</Text>
              <Text>{item.telefone}</Text>
              <Text>{item.email}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => atualizarContato(item.id, 'Novo Nome', '(00)00000-0000', 'novo@email.com')}><Image style={{ width: 50, height: 50 }} source={require('./assets/garfield-edit.png')} /></Pressable>
              <Pressable onPress={() => deletarContato(item.id)}><Image style={{ width: 40, height: 40 }} source={require('./assets/deletar.png')} /></Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffe587ff",
  },
  logo: {
    flex: 1,
    alignContent: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
    marginTop: 30,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 20,
    color: "#ffa502",
  },
  lista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ffa502",
    color: "#fff",
  },
  texto: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  }
});