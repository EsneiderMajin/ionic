import { CommonModule, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonModal, IonItemSliding, IonItemOption, IonItemOptions, IonFab, IonFabButton, IonAvatar, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Task } from './task';
import { toast } from 'ngx-sonner';
import { initializeApp } from "firebase/app";
import { add, checkmark, trash } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { getDatabase, set, ref, get, update, remove, onValue } from 'firebase/database';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';


const firebaseConfig = {
  apiKey: "AIzaSyDOQEnY9cdFRNot_iGPwDYpN3c5MMdfgMs",
  authDomain: "basemovil-172fe.firebaseapp.com",
  projectId: "basemovil-172fe",
  storageBucket: "basemovil-172fe.appspot.com",
  messagingSenderId: "422832587516",
  appId: "1:422832587516:web:3fcecce7aa36acd09fcd79",
  measurementId: "G-TV9KWFNDTE"
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardTitle, IonCardHeader, IonAvatar, IonFabButton, IonFab, IonItemOptions, IonItemOption, IonItemSliding, IonInput, IonModal, NgFor, IonLabel, IonItem, 
    IonIcon, IonButton, IonButtons, CommonModule, IonHeader, IonToolbar, FormsModule, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList],
})
export class HomePage {
  @ViewChild(IonModal) modal: IonModal;
  protected readonly toast = toast;
  name: string = '';
  tasks: Array<Task> = [];

  theNewTask: string|null = "";
  app = initializeApp(firebaseConfig);
  db = getDatabase(this.app);
  
  constructor(public alertController: AlertController) {
    addIcons({ add, checkmark, trash });
    
    const dataListRef = ref(this.db, 'tasks');
    onValue(dataListRef, (snapshot) => {
      const data = snapshot.val();
      this.tasks = []; 
      if (data == null) return;
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        console.log('key:', key)
        const element = childSnapshot.val();
        console.log('element:', element)
        this.tasks.push({id: key, title: element.title, status: element.status});
      });
    });
  }

  addItem() {
    
    if (this.name != '') {
      set(ref(this.db, 'tasks/' + this.name), {
        title: this.name,
        status: 'open'
      }).then( () => {
        this.name = '';
        this.modal.dismiss(this.name, 'confirm');
        toast.success('Task added successfully');
      })
      .catch( (error) => {
        alert("Error");
        console.log(error);
      });

    }

  }

  confirmAddItem() {
    if (this.name !== '') {
      set(ref(this.db, 'tasks/' + this.name), {
        title: this.name,
        status: 'open'
      }).then(() => {
        this.name = ''; 
        this.modal.dismiss();
        toast.success('Task added successfully');
      }).catch((error) => {
        console.error('Error adding task:', error);
        toast.error('Error adding task');
      });
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  trackItems(index: number, itemObject: any) {
    return itemObject.title;
  }

  // Método para marcar una tarea como completada
  markAsDone(slidingItem: IonItemSliding, task: Task) {
    update(ref(this.db, 'tasks/' + task.id), {
      title: task.title,
      status: 'done'
    }).then( () => {
      
      toast.info('Task marked as done');
    })
    .catch( (error) => {
      alert("Error");
      console.log(error);
    })

    setTimeout( () => { slidingItem.close() }, 2);

  }

  getTaskFromFirebase() {
    const dataListRef = ref(this.db, 'tasks');
    onValue(dataListRef, (snapshot) => {
      const data = snapshot.val();
      if (data == null) return;
      this.tasks = []; 
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key; 
        const element = childSnapshot.val();
        this.tasks.push({id: key, title: element.title, status: element.status});
      });
    });
  }

  async removeTask(slidingItem: IonItemSliding, task: Task) {
    const alert = await this.alertController.create({
      header: 'Remove task',
      message: 'Are you sure you want to remove this task?',
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'remove it!',
          handler: () => {
            remove(ref(this.db, 'tasks/' + task.id)).then( () => {
              toast.success('Task removed successfully');
            })
            .catch( (error) => {
              toast.error('Error removing task');
              console.log(error);
            })
            setTimeout( () => { slidingItem.close() }, 2);
          }
        }
      ]  
    });

    await alert.present();
  }

}
