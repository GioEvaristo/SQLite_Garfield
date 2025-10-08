// Dupla: Gabriel Machado e Giovanna Fonseca
// Turma: 3º Informática

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Image, Pressable, ScrollView } from "react-native";
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
    await db.runAsync("UPDATE contatos SET nome = ?, telefone = ?, email = ? WHERE id = ?;", [nome, telefone, email, id]);
    carregarContatos();
    console.log("atualizado");
  }

  const deletarContato = async (id: number) => {
    if (!db) {
      return;
    }
    await db.runAsync("DELETE FROM contatos WHERE id = ?;", [id]);
    carregarContatos();
    console.log("excluido");
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logo}>
        <Image style={{ width: 80, height: 60, }} source={require('./assets/logo-garfield.png')}></Image>
        <Text style={styles.titulo}>Contatos do Garfield</Text>
      </View>
      <Text style={styles.textobotao}>Nome do contato</Text>
      <TextInput
        placeholder="Digite o nome..."
        value={nome}
        onChangeText={setNome}
        style={styles.texto}
      />
      <Text style={styles.textobotao}>Telefone</Text>
      <TextInput
        placeholder="(00)00000-0000"
        value={telefone}
        onChangeText={setTelefone}
        style={styles.texto}
      />
      <Text style={styles.textobotao}>Email</Text>
      <TextInput
        placeholder="garfield@exemplo.com"
        value={email}
        onChangeText={setEmail}
        style={styles.texto}
      />
      <Pressable style={styles.botaoadicionar} onPress={adicionarContato}><Text style={styles.textobotao}>Adicionar Contato</Text></Pressable>

      <FlatList
        data={contatos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.lista}>
            <Image style={styles.fotoperfil} source={require("./assets/garfield-icon.png")}/>
            <View style={{ flexDirection: "column" }}>
              <Text>{item.nome}</Text>
              <Text>{item.telefone}</Text>
              <Text>{item.email}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => atualizarContato(item.id, 'Novo nome', '(00)00000-0000', 'novo@email.com')}><Image style={{ width: 50, height: 50 }} source={require('./assets/garfield-edit.png')} /></Pressable>
              <Pressable onPress={() => deletarContato(item.id)}><Image style={{ width: 40, height: 40 }} source={require('./assets/deletar.png')} /></Pressable>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "moccasin",
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
    color: "darkorange",
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
    borderWidth: 2,
    borderColor: "#FF9A00",
    padding: 10,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#FFE587",
    color: 'lightgray',
    fontWeight: "bold",
  },
  textobotao: {
    color: 'darkorange',
    fontWeight: "bold",
    fontSize: 15,
  },
  botaoadicionar: {
    alignSelf: "center",
    display: "flex",
    backgroundColor: "#caeefeff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
    width: 160,
  },
   fotoperfil: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FF9A00",
    backgroundColor: "#FFF",
  },
});